const input = document.querySelector('#input');
const charactersCount = document.querySelector('#characters-count');
const charactersNoSpaces = document.querySelector('#characters-no-spaces');
const wordsCount = document.querySelector('#words-count');
const clearButton = document.querySelector('#clear');

// Conta caracteres "visíveis": emojis e letras acentuadas contam como 1
const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }) : null;

function countCharacters(text) {
    if (segmenter) return [...segmenter.segment(text)].length;
    return [...text].length;
}

function plural(n, singular, pluralForm) {
    return `${n.toLocaleString('pt-BR')} ${n === 1 ? singular : pluralForm}`;
}

function updateCount() {
    const text = input.value;
    const characters = countCharacters(text);
    const noSpaces = countCharacters(text.replace(/\s/g, ''));
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    charactersCount.textContent = plural(characters, 'caractere', 'caracteres');
    charactersNoSpaces.textContent = plural(noSpaces, 'caractere sem espaços', 'caracteres sem espaços');
    wordsCount.textContent = plural(words, 'palavra', 'palavras');
}

input.addEventListener('input', updateCount);

clearButton.addEventListener('click', () => {
    input.value = '';
    updateCount();
    input.focus();
});

updateCount();
