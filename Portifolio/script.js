// Lista de projetos exibidos na seção "Projetos".
// Para adicionar um novo, basta incluir um objeto aqui.
const BASE = 'https://cgb102000.github.io/Projetos-publicos/';
const REPO = 'https://github.com/cgb102000/Projetos-publicos/tree/main/';

const projetos = [
  {
    nome: 'Teste automatizado MenuDino',
    descricao: 'Teste exploratório automatizado que valida o fluxo de preenchimento de endereço no site MenuDino.',
    tags: ['QA', 'Robot Framework', 'Playwright'],
    codigo: 'https://github.com/cgb102000/teste-automatizado-menudino',
  },
  {
    nome: 'Faturô',
    descricao: 'Sistema de gestão para pequenos negócios: caixa, mesas com QR Code, estoque, clientes, equipe com permissões, dashboard com DRE e dicas geradas por IA.',
    tags: ['React', 'Node.js', 'MongoDB', 'IA'],
    demo: 'https://faturo-frontend.vercel.app/home',
  },
  {
    nome: 'NutriVision AI',
    descricao: 'Tire uma foto da refeição e a IA estima calorias e macronutrientes. Diário nutricional, metas diárias, sequência de dias e pontos. Login com Google.',
    tags: ['React', 'Supabase', 'IA', 'Vercel'],
    demo: 'https://nutri-vision-umber.vercel.app',
  },
  {
    nome: 'VOLT Fitness',
    descricao: 'App de treinos com rotina semanal, execução marcando as séries de cada exercício e painel de progresso com sequência de dias e histórico.',
    tags: ['Lovable', 'Login com Google'],
    demo: 'https://voltfitness.lovable.app',
  },
  {
    nome: 'GeekCore',
    descricao: 'Plataforma fullstack para fãs de filmes e animes, com login, perfis, amizades, favoritos, comentários e compartilhamento de vídeos.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
    demo: BASE + 'GeekCore/',
    codigo: REPO + 'GeekCore',
  },
  {
    nome: 'GeekHub',
    descricao: 'Catálogo de filmes e animes que consome a API REST do GeekCore (Express + MongoDB), com busca, categorias e detalhes.',
    tags: ['JavaScript', 'REST API', 'MongoDB'],
    demo: BASE + 'GeekHub/',
    codigo: REPO + 'GeekHub',
  },
  {
    nome: 'Música para Todos',
    descricao: 'Busca de músicas, artistas e álbuns em tempo real usando a Web API do Spotify.',
    tags: ['JavaScript', 'Spotify API'],
    demo: BASE + 'Spotify/',
    codigo: REPO + 'Spotify',
  },
  {
    nome: 'Pokédex',
    descricao: 'Pokédex interativa que consulta os dados de cada Pokémon em tempo real.',
    tags: ['JavaScript', 'PokéAPI'],
    demo: BASE + 'Pokedex/',
    codigo: REPO + 'Pokedex',
  },
  {
    nome: 'FarmaUnix',
    descricao: 'Farmácia online com carrinho, taxa de entrega calculada pela distância, mapa da rota e pedido pelo WhatsApp.',
    tags: ['JavaScript', 'Leaflet', 'OpenStreetMap'],
    demo: BASE + 'FarmaUnix/src/',
    codigo: REPO + 'FarmaUnix',
  },
  {
    nome: 'Ciclos',
    descricao: 'App para acompanhar ciclos de medicamentos, com calendário, lembretes no Telegram, controle de estoque, histórico e smoke test automatizado da API.',
    tags: ['Node.js', 'PostgreSQL', 'Prisma', 'PWA', 'Testes de API'],
  },
  {
    nome: 'Audio to Text',
    descricao: 'Transcreve arquivos de áudio para texto usando o modelo Whisper.',
    tags: ['Python', 'Flask', 'Whisper'],
    codigo: REPO + 'Audio%20to%20Text',
  },
  {
    nome: 'Redimensionar Imagem',
    descricao: 'Redimensiona imagens direto no navegador, de forma rápida e prática.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    demo: BASE + 'Redimensionar%20Imagem/',
    codigo: REPO + 'Redimensionar%20Imagem',
  },
  {
    nome: 'Contador de Palavras',
    descricao: 'Conta palavras e caracteres de um texto em tempo real.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    demo: BASE + 'Contador%20de%20caracteres%20e%20palavras/',
    codigo: REPO + 'Contador%20de%20caracteres%20e%20palavras',
  },
];

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function renderizarProjetos() {
  const grade = document.getElementById('grade-projetos');
  grade.innerHTML = projetos.map((p) => {
    const acoes = [
      p.demo && `<a class="principal" href="${p.demo}" target="_blank" rel="noopener">Acessar</a>`,
      p.codigo && `<a href="${p.codigo}" target="_blank" rel="noopener">Código</a>`,
    ].filter(Boolean);

    return `
      <article class="projeto">
        <h3>${escapar(p.nome)}</h3>
        <p>${escapar(p.descricao)}</p>
        <ul class="tags">${p.tags.map((t) => `<li>${escapar(t)}</li>`).join('')}</ul>
        <div class="acoes">${acoes.length ? acoes.join('') : '<span class="privado">Repositório privado</span>'}</div>
      </article>`;
  }).join('');
}

// Menu para celular
function configurarMenu() {
  const botao = document.querySelector('.menu-botao');
  const menu = document.getElementById('menu');

  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
    });
  });
}

// Fundo de partículas (substitui o vídeo de 49 MB)
function iniciarParticulas() {
  const canvas = document.getElementById('particulas');
  const ctx = canvas.getContext('2d');
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particulas = [];
  let largura = 0;
  let altura = 0;

  function redimensionar() {
    const dpr = window.devicePixelRatio || 1;
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const quantidade = Math.min(90, Math.floor((largura * altura) / 14000));
    particulas = Array.from({ length: quantidade }, () => ({
      x: Math.random() * largura,
      y: Math.random() * altura,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    }));
  }

  function desenhar() {
    ctx.clearRect(0, 0, largura, altura);

    for (let i = 0; i < particulas.length; i++) {
      const a = particulas[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > largura) a.vx *= -1;
      if (a.y < 0 || a.y > altura) a.vy *= -1;

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(86, 243, 81, 0.7)';
      ctx.fill();

      for (let j = i + 1; j < particulas.length; j++) {
        const b = particulas[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(163, 91, 208, ${0.35 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (!reduzirMovimento) requestAnimationFrame(desenhar);
  }

  redimensionar();
  window.addEventListener('resize', () => {
    redimensionar();
    if (reduzirMovimento) desenhar();
  });
  desenhar();
}

document.getElementById('ano').textContent = new Date().getFullYear();
renderizarProjetos();
configurarMenu();
iniciarParticulas();
