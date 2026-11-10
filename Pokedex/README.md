# Pokédex

Pokédex que consulta dados de Pokémon em tempo real na [PokéAPI](https://pokeapi.co).

🌐 **Acesse:** https://cgb102000.github.io/Projetos-publicos/Pokedex/

## Funcionalidades

- Busca por **nome** (`pikachu`) ou **número** (`25`, `#25`)
- Botão **Aleatório**, que sorteia entre os 1025 Pokémon
- Card com arte oficial, número, tipos traduzidos e coloridos, altura, peso e atributos base em barras
- Mensagens de erro para Pokémon inexistente e para falta de conexão com a API
- Botões desabilitados durante a busca, para evitar requisições repetidas

## Tecnologias

- HTML, CSS e JavaScript puro
- `fetch` com `async/await`
- PokéAPI (`/api/v2/pokemon/{nome ou número}`)

## Como rodar

Não precisa instalar nada: abra o `index.html` no navegador.

## Estrutura

```
Pokedex/
├── index.html   # Formulário de busca e área do card
├── script.js    # Chamada à PokéAPI e montagem do card
└── style.css    # Layout e cores por tipo
```
