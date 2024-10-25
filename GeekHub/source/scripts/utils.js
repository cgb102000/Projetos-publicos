// utils.js
// Função para capitalizar a primeira letra de uma string
function capitalizarPrimeiraLetra(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export { capitalizarPrimeiraLetra };
