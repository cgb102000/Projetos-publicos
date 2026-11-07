// Escapa caracteres especiais para usar texto digitado pelo usuário dentro de uma RegExp.
// Sem isso, buscas como "(a+)+$" podem travar o servidor e ".*" retorna tudo.
const escapeRegex = (texto = '') => String(texto).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegex;
