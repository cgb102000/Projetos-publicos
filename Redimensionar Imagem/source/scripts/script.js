// script.js

document.getElementById('resize-button').addEventListener('click', async () => {
    const files = document.getElementById('file-input').files;
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    const status = document.getElementById('status');

    // Validação: Verifica se a largura e a altura são válidas
    if (!files.length) {
        status.textContent = "Por favor, selecione pelo menos uma imagem.";
        return;
    }
    if (isNaN(width) || width < 1 || isNaN(height) || height < 1) {
        status.textContent = "Por favor, insira valores válidos para largura e altura (maiores que 0).";
        return;
    }

    // Loop através dos arquivos selecionados e redimensiona cada imagem
    for (const file of files) {
        const image = await loadImage(file);
        const resizedImage = resizeImage(image, width, height);
        downloadImage(resizedImage, `resized_${file.name}`);
        status.textContent = `Imagem ${file.name} redimensionada e baixada com sucesso!`;
    }
});

// Função para carregar a imagem
function loadImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => resolve(img);
        };
        reader.readAsDataURL(file);
    });
}

// Função para redimensionar a imagem
function resizeImage(image, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png'); // Retorna a imagem redimensionada como um Data URL
}

// Função para baixar a imagem redimensionada
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click(); // Simula o clique para download
    document.body.removeChild(link); // Remove o link do DOM
}
