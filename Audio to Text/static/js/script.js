// Função para transcrever áudio
function transcribeAudio() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo de áudio.");
        return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    // Atualiza o status
    const statusElement = document.getElementById('status');
    const loadingElement = document.getElementById('loading');
    statusElement.innerText = "Transcrevendo... Aguarde.";
    loadingElement.style.display = "block";

    // Faz a requisição para transcrever
    fetch('/transcribe', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        statusElement.innerText = "Transcrição concluída!";
        loadingElement.style.display = "none";
        document.getElementById('transcription').value = data.transcription;

        // Atualiza o link para download
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = data.transcription_url;
        downloadLink.style.display = 'block';
        downloadLink.innerText = "Baixar Transcrição";
    })
    .catch(error => {
        console.error("Erro:", error);
        statusElement.innerText = "Erro na transcrição!";
        loadingElement.style.display = "none";
        alert("Erro ao transcrever o áudio: " + error.message);
    });
}
