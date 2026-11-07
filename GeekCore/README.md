# GeekCore

Uma plataforma web para amantes de filmes e animes, onde usuários podem descobrir, favoritar e interagir com conteúdo.

## 📖 Sumário
- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [API](#api)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Licença](#licença)

## Visão Geral

GeekCore é uma aplicação web fullstack que oferece:
- Catálogo de filmes e animes
- Sistema de autenticação
- Perfis de usuário personalizáveis
- Sistema de amizades
- Lista de favoritos
- Temas personalizáveis
- Interface responsiva

## Tecnologias

### Frontend
- React
- TailwindCSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT (autenticação)

## Estrutura do Projeto

```
geekcore/
├── src/                    # Código fonte React
│   ├── components/         # Componentes reutilizáveis
│   ├── contexts/          # Contextos React (tema, auth)
│   ├── pages/             # Páginas da aplicação
│   └── services/          # Serviços e APIs
├── public/                 # Arquivos estáticos
├── server/                 # Backend
│   ├── models/            # Modelos MongoDB
│   ├── routes/            # Rotas da API
│   └── middleware/        # Middlewares Express
└── build/                 # Arquivos de produção
```

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/cgb102000/Projetos-publicos.git
cd Projetos-publicos/GeekCore
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente copiando o modelo e preenchendo os valores:
```bash
cp .env.example .env
```

   > Use o nome `.env` em minúsculas. No Windows `.ENV` funciona, mas em servidores Linux o arquivo não é encontrado.

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev           # Backend
npm run start        # Frontend
```

## Configuração

### Variáveis de Ambiente (.env)
```env
# Banco de Dados
MONGO_URI=mongodb://localhost:27017/geekcore

# Servidor
PORT=3001
HOST=0.0.0.0

# Autenticação
JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=7d

# API
API_BASE_URL=http://localhost:3001
```

## API

### Endpoints

#### Autenticação
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/perfil
PUT  /api/auth/perfil
```

#### Conteúdo
```
GET /api/search?q=termo
GET /api/item/:id
GET /api/random
GET /api/recent
GET /api/categories
```

#### Social
```
POST /api/auth/amizade/solicitar
POST /api/auth/amizade/responder
GET  /api/auth/amigos
POST /api/auth/favoritos
```

### Exemplo de Uso

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
});

// Buscar item
const item = await fetch(`/api/item/${id}`).then(r => r.json());
```

## Desenvolvimento

### Scripts Disponíveis

```bash
npm run start:frontend  # Inicia servidor React
npm run start:backend   # Inicia servidor Express (nodemon)
npm run api             # Inicia só a API (produção)
npm run build:css      # Compila TailwindCSS
npm run watch:css      # Watch mode TailwindCSS
npm run build          # Build de produção
```

### Estrutura de Componentes

- `AbasAmigos`: Gerencia relacionamentos de amizade
- `Navbar`: Navegação principal e busca
- `Perfil`: Exibe/edita informações do usuário
- `Login/Register`: Autenticação de usuários

## Deploy

### Publicação atual

| Parte | Onde | Endereço |
|---|---|---|
| Site (React) | GitHub Pages | https://cgb102000.github.io/Projetos-publicos/GeekCore/ |
| API (Express + MongoDB Atlas) | Vercel (função serverless) | https://geekcore.vercel.app |

**API na Vercel**: `api/index.js` exporta o app Express, e o `vercel.json` manda todas as rotas para ele. A conexão com o MongoDB é aberta na primeira requisição e reaproveitada nas seguintes. O `.vercelignore` deixa de fora o front, o `node_modules` e o `.env`. As variáveis `MONGO_URI` e `JWT_SECRET` ficam no painel da Vercel (Settings → Environment Variables). Para publicar de novo:

```bash
cd GeekCore
npx vercel deploy --prod
```

**Site no GitHub Pages**: o Pages não tem etapa de build, então a pasta `build/` vai versionada. O `index.html` da raiz do GeekCore redireciona para ela. As rotas usam `HashRouter` (`#/login`, `#/detalhes/videos/:id`) para funcionar sem configuração de servidor, e o endereço da API fica em `public/config.js`, que pode ser trocado sem recompilar. Depois de mudar o front:

```bash
npm run build   # gera build/ com caminhos relativos ("homepage": ".")
```

No Atlas, o **Network Access** precisa liberar `0.0.0.0/0`, porque a Vercel não tem IP fixo. O CORS libera `https://cgb102000.github.io` e `localhost`; outras origens vão em `CORS_ORIGINS`.

### Servidor próprio

1. Build do projeto:
```bash
npm run build
```

2. Configure o servidor:
```bash
# Instale o PM2
npm install -g pm2

# Inicie a aplicação
pm2 start server.js
```

## Licença

MIT License - veja LICENSE.md para mais detalhes.
