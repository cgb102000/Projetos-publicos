const input = document.querySelector('#input');
const charactersCount = document.querySelector('#characters-count');
const wordsCount = document.querySelector('#words-count');

// Função para atualizar as contagens
function updateCount() {
    const text = input.value;
    
    // Contagem de caracteres
    const characters = text.length;
    charactersCount.textContent = `${characters} caractere(s)`;

    // Contagem de palavras
    const words = text.trim().split(/\s+/).filter(word => word !== "").length;
    wordsCount.textContent = `${words} palavra(s)`;
}

// Evento para atualizar a contagem ao digitar
input.addEventListener("input", updateCount);

// Inicializa a contagem ao carregar a página
updateCount();
