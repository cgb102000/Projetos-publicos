# Contador de Caracteres e Palavras

Conta caracteres e palavras de um texto em tempo real, direto no navegador.

🌐 **Acesse:** https://cgb102000.github.io/Projetos-publicos/Contador%20de%20caracteres%20e%20palavras/

## Funcionalidades

- Total de **caracteres**, de **caracteres sem espaços** e de **palavras**, atualizados a cada tecla
- Emojis e letras acentuadas contam como **1 caractere** (`Intl.Segmenter`, com alternativa para navegadores antigos)
- Singular e plural corretos ("1 palavra", "2 palavras") e números no formato brasileiro
- Botão **Limpar texto**
- Resultado anunciado para leitores de tela (`aria-live`)

## Tecnologias

- HTML, CSS e JavaScript puro

## Como rodar

Não precisa instalar nada: abra o `index.html` no navegador.

## Estrutura

```
Contador de caracteres e palavras/
├── index.html   # Campo de texto e contadores
├── index.js     # Lógica de contagem
└── style.css    # Layout
```
