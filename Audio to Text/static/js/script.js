const form = document.getElementById('form');
const fileInput = document.getElementById('audioFile');
const nomeArquivo = document.getElementById('nome-arquivo');
const idioma = document.getElementById('language');
const botao = document.getElementById('botao');
const status = document.getElementById('status');
const resultado = document.getElementById('resultado');
const transcricao = document.getElementById('transcription');
const downloadLink = document.getElementById('downloadLink');
const copiar = document.getElementById('copiar');

let urlDownload = null;

fileInput.addEventListener('change', () => {
    nomeArquivo.textContent = fileInput.files[0]?.name || 'Escolher arquivo de áudio';
});

function mostrarStatus(texto, erro = false) {
    status.textContent = texto;
    status.classList.toggle('erro', erro);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const arquivo = fileInput.files[0];
    if (!arquivo) {
        mostrarStatus('Selecione um arquivo de áudio.', true);
        return;
    }

    const dados = new FormData();
    dados.append('audio', arquivo);
    dados.append('language', idioma.value);

    botao.disabled = true;
    resultado.hidden = true;
    mostrarStatus('Transcrevendo... Dependendo do tamanho do áudio, pode levar alguns minutos.');

    try {
        const resposta = await fetch('/transcribe', { method: 'POST', body: dados });
        const json = await resposta.json().catch(() => ({ error: `Erro ${resposta.status} no servidor` }));
        if (!resposta.ok || json.error) throw new Error(json.error);

        transcricao.value = json.transcription;

        if (urlDownload) URL.revokeObjectURL(urlDownload);
        urlDownload = URL.createObjectURL(new Blob([json.transcription], { type: 'text/plain;charset=utf-8' }));
        downloadLink.href = urlDownload;
        downloadLink.download = json.filename;

        resultado.hidden = false;
        mostrarStatus('Transcrição concluída!');
    } catch (erro) {
        mostrarStatus(erro.message || 'Erro ao transcrever o áudio.', true);
    } finally {
        botao.disabled = false;
    }
});

copiar.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(transcricao.value);
        copiar.textContent = 'Copiado!';
    } catch {
        transcricao.select();
        copiar.textContent = 'Selecionado';
    }
    setTimeout(() => (copiar.textContent = 'Copiar'), 1500);
});
