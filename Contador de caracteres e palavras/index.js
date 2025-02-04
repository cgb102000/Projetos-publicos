const input = document.querySelector('#input');
const counter = document.querySelector('.counter');
const toggle = document.querySelector('#toggle');

let mode = "characters"; // Modo inicial

// Função para atualizar a contagem
function updateCount() {
    let count = 0;
    
    if (mode === "characters") {
        count = input.value.length;
        counter.textContent = `${count} caractere(s)`;
    } else {
        count = input.value.trim().split(/\s+/).filter(word => word !== "").length;
        counter.textContent = `${count} palavra(s)`;
    }
}

// Evento para atualizar a contagem ao digitar
input.addEventListener("input", updateCount);

// Função para alternar modo
function toggleMode() {
    mode = mode === "characters" ? "words" : "characters";
    toggle.textContent = mode === "characters" ? "Contar Palavras" : "Contar Caracteres";
    
    // Atualizar a contagem ao alternar o modo
    updateCount();
}

// Evento para alternar o modo ao clicar no botão
toggle.addEventListener("click", toggleMode);

// Evento para alternar o modo ao pressionar Enter no campo de entrada
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Impede a quebra de linha no textarea
        toggleMode();
    }
});
