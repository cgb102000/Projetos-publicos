# Portfólio

Meu portfólio pessoal, com apresentação, lista de projetos e contato.

🌐 [Acessar](https://cgb102000.github.io/Projetos-publicos/Portifolio/)

## Tecnologias

HTML, CSS e JavaScript puro. Não precisa de instalação nem de build: o GitHub Pages publica os arquivos direto.

## Estrutura

- `index.html`: estrutura da página
- `style.css`: estilos
- `script.js`: lista de projetos, menu para celular e fundo de partículas
- `imagens/`: foto e logo

## Como adicionar um projeto

Inclua um novo item na lista `projetos`, no início do `script.js`:

```js
{
  nome: 'Meu Projeto',
  descricao: 'O que o projeto faz.',
  tags: ['JavaScript'],
  demo: 'https://link-da-demo',      // opcional
  codigo: 'https://link-do-codigo',  // opcional
},
```

## Rodar localmente

Abra o `index.html` no navegador, ou sirva a pasta com qualquer servidor estático:

```bash
npx serve .
```
