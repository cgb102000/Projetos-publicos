# Música para Todos

Busca de músicas, artistas e álbuns em tempo real usando a [Web API do Spotify](https://developer.spotify.com/documentation/web-api).

🌐 **Acesse:** https://cgb102000.github.io/Projetos-publicos/Spotify/

## Funcionalidades

- Uma busca retorna **músicas**, **artistas** e **álbuns** (mercado BR)
- Músicas com capa, artistas, álbum, duração e link para ouvir no Spotify
- Artistas com número de seguidores e álbuns com ano de lançamento
- Sugestões de busca em um clique
- Token de acesso reaproveitado e renovado antes de expirar (vale 1 hora)
- Textos vindos da API escapados antes de entrar no HTML

## Tecnologias

- HTML, CSS e JavaScript (ES Modules)
- Spotify Web API: autenticação `client_credentials` e endpoint `/v1/search`

## Como rodar

Os arquivos usam ES Modules, então precisam de um servidor local (abrir o `index.html` direto não funciona):

```bash
npx serve .
```

## Estrutura

```
Spotify/
├── index.html
├── app.js            # Busca e renderização dos resultados
└── src/
    ├── auth.js       # Obtenção e cache do token
    ├── spotify.js    # Chamada à API
    └── assets/       # Ícone e estilos
```
