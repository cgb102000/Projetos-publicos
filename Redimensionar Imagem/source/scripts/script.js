const form = document.getElementById('form');
const fileInput = document.getElementById('file-input');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const keepRatio = document.getElementById('keep-ratio');
const formatSelect = document.getElementById('format');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const status = document.getElementById('status');
const results = document.getElementById('results');
const resultsList = document.getElementById('results-list');
const downloadAllButton = document.getElementById('download-all');

const EXTENSOES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
let urlsGeradas = [];

qualityInput.addEventListener('input', () => {
    qualityValue.textContent = `${qualityInput.value}%`;
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = [...fileInput.files];
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    const temLargura = width > 0;
    const temAltura = height > 0;

    if (!files.length) {
        mostrarStatus('Selecione pelo menos uma imagem.', true);
        return;
    }
    if (keepRatio.checked ? !temLargura && !temAltura : !temLargura || !temAltura) {
        mostrarStatus(keepRatio.checked
            ? 'Informe a largura, a altura ou as duas.'
            : 'Informe largura e altura maiores que 0.', true);
        return;
    }

    limparResultados();
    mostrarStatus('Processando...');

    let sucesso = 0;
    for (const file of files) {
        try {
            const image = await carregarImagem(file);
            const tamanho = calcularTamanho(image, temLargura ? width : null, temAltura ? height : null);
            const tipo = escolherFormato(file.type);
            const blob = await redimensionar(image, tamanho, tipo, qualityInput.value / 100);
            adicionarResultado(file, blob, tamanho, tipo);
            sucesso++;
        } catch (erro) {
            adicionarErro(file, erro.message);
        }
    }

    results.hidden = false;
    mostrarStatus(`${sucesso} de ${files.length} imagem(ns) redimensionada(s).`, sucesso === 0);
});

downloadAllButton.addEventListener('click', async () => {
    const links = resultsList.querySelectorAll('a[download]');
    for (const link of links) {
        link.click();
        // Pequena pausa para o navegador não bloquear downloads seguidos
        await new Promise((r) => setTimeout(r, 300));
    }
});

function mostrarStatus(texto, erro = false) {
    status.textContent = texto;
    status.classList.toggle('erro', erro);
}

function carregarImagem(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('não foi possível abrir este arquivo como imagem'));
        };
        img.src = url;
    });
}

function calcularTamanho(image, width, height) {
    const w0 = image.naturalWidth;
    const h0 = image.naturalHeight;

    if (keepRatio.checked) {
        if (width && height) {
            // Cabe dentro da caixa informada sem distorcer
            const escala = Math.min(width / w0, height / h0);
            return { width: Math.round(w0 * escala), height: Math.round(h0 * escala) };
        }
        if (width) return { width, height: Math.max(1, Math.round(h0 * (width / w0))) };
        return { width: Math.max(1, Math.round(w0 * (height / h0))), height };
    }
    return { width, height };
}

function escolherFormato(tipoOriginal) {
    if (formatSelect.value !== 'original') return formatSelect.value;
    return EXTENSOES[tipoOriginal] ? tipoOriginal : 'image/png';
}

function redimensionar(image, { width, height }, tipo, qualidade) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    if (tipo === 'image/jpeg') {
        // JPEG não tem transparência: usa fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(image, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            blob ? resolve(blob) : reject(new Error('falha ao gerar a imagem'));
        }, tipo, qualidade);
    });
}

function nomeArquivo(nomeOriginal, tipo) {
    const base = nomeOriginal.replace(/\.[^.]+$/, '');
    return `${base}_redimensionada.${EXTENSOES[tipo]}`;
}

function formatarTamanho(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function adicionarResultado(file, blob, tamanho, tipo) {
    const url = URL.createObjectURL(blob);
    urlsGeradas.push(url);

    const li = document.createElement('li');
    li.innerHTML = `
        <img alt="">
        <div class="info">
            <strong></strong>
            <span></span>
        </div>
        <a class="botao-link">Baixar</a>`;
    li.querySelector('img').src = url;
    li.querySelector('strong').textContent = nomeArquivo(file.name, tipo);
    li.querySelector('span').textContent =
        `${tamanho.width} × ${tamanho.height} px · ${formatarTamanho(file.size)} → ${formatarTamanho(blob.size)}`;
    const link = li.querySelector('a');
    link.href = url;
    link.download = nomeArquivo(file.name, tipo);
    resultsList.appendChild(li);
}

function adicionarErro(file, mensagem) {
    const li = document.createElement('li');
    li.className = 'erro';
    li.textContent = `${file.name}: ${mensagem}`;
    resultsList.appendChild(li);
}

function limparResultados() {
    urlsGeradas.forEach((url) => URL.revokeObjectURL(url));
    urlsGeradas = [];
    resultsList.innerHTML = '';
    results.hidden = true;
}
