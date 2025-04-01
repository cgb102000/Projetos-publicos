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
git clone https://github.com/seu-usuario/geekcore.git
cd geekcore
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```env
MONGO_URI=sua_url_mongodb
JWT_SECRET=seu_jwt_secret
PORT=3001
```

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
npm run start:backend   # Inicia servidor Express
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
