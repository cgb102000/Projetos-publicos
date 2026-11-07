# GeekHub

Catálogo de filmes e animes em HTML, CSS e JavaScript puros. Ele consome a API REST do [GeekCore](../GeekCore/) (Express + MongoDB).

🌐 [Acessar](https://cgb102000.github.io/Projetos-publicos/GeekHub/)

## Funcionalidades

- Lista dos títulos adicionados recentemente (`GET /api/recent`)
- Filtro por categoria (`GET /api/categories` e `GET /api/category/:categoria`)
- Busca por título (`GET /api/search?q=`)
- Página de detalhes com sugestões aleatórias (`GET /api/item/:id` e `GET /api/random`)
- Mensagens claras para busca sem resultado, título inexistente e API fora do ar
- Textos da API escapados antes de entrar no HTML, para evitar injeção de código
- Layout responsivo com capa padrão quando o título não tem imagem

## Estrutura

```
├── index.html          # Catálogo: recentes, categorias e busca
├── detalhes.html       # Detalhes do título + "Assista também"
└── assets/
    ├── config.js       # URL da API (local ou produção)
    ├── api.js          # Chamadas à API e montagem dos cards
    ├── home.js         # Lógica do catálogo
    ├── detalhes.js     # Lógica da página de detalhes
    ├── style.css
    └── sem-capa.svg
```

## Como rodar localmente

1. Suba a API do GeekCore com um `MONGO_URI` válido no `.env`:
   ```bash
   cd GeekCore
   npm install
   npm run api
   ```
2. Sirva o GeekHub em outro terminal:
   ```bash
   python -m http.server 5500 --directory GeekHub
   ```
3. Abra `http://localhost:5500`. Em `localhost`, o GeekHub usa a API em `http://localhost:3001`.

## Produção

O GitHub Pages hospeda só o front-end. A API precisa estar publicada (veja **Deploy** no [README do GeekCore](../GeekCore/README.md#deploy)), e a URL dela vai em `API_PRODUCAO`, no arquivo `assets/config.js`.
