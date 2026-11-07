// Ilustrações em SVG das embalagens (geradas no navegador, sem depender de imagens externas).

function clarear(hex, fator) {
  const n = parseInt(hex.slice(1), 16);
  const canal = (deslocamento) => {
    const c = (n >> deslocamento) & 255;
    return Math.round(c + (fator > 0 ? (255 - c) * fator : c * fator));
  };
  return `rgb(${canal(16)}, ${canal(8)}, ${canal(0)})`;
}

function escaparSvg(texto) {
  return String(texto).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function caixa(p, x = 38, y = 34, largura = 118, altura = 96) {
  const prof = 18;
  const cor = p.cor;
  const nome = escaparSvg(p.nome);
  const tamanhoNome = p.nome.length > 9 ? 15 : 19;
  return `
    <polygon points="${x},${y} ${x + prof},${y - prof * 0.75} ${x + largura + prof},${y - prof * 0.75} ${x + largura},${y}" fill="${clarear(cor, 0.55)}"/>
    <polygon points="${x + largura},${y} ${x + largura + prof},${y - prof * 0.75} ${x + largura + prof},${y + altura - prof * 0.75} ${x + largura},${y + altura}" fill="${clarear(cor, -0.25)}"/>
    <rect x="${x}" y="${y}" width="${largura}" height="${altura}" fill="#ffffff"/>
    <rect x="${x}" y="${y}" width="6" height="${altura}" fill="${cor}"/>
    <path d="M${x} ${y + altura - 30} H${x + largura} V${y + altura} H${x} Z" fill="${cor}"/>
    <path d="M${x + largura - 46} ${y + altura - 30} Q${x + largura - 20} ${y + altura - 46} ${x + largura} ${y + altura - 40} V${y + altura - 30} Z" fill="${clarear(cor, 0.35)}"/>
    <text x="${x + 16}" y="${y + 30}" font-family="Roboto, Arial, sans-serif" font-weight="900" font-size="${tamanhoNome}" fill="${cor}">${nome}</text>
    <text x="${x + 16}" y="${y + 46}" font-family="Roboto, Arial, sans-serif" font-size="9.5" fill="#5f6b7a">${escaparSvg(p.dosagem)}</text>
    <text x="${x + 16}" y="${y + altura - 11}" font-family="Roboto, Arial, sans-serif" font-weight="700" font-size="9" fill="#ffffff">${escaparSvg(p.quantidade)}</text>
    ${p.receita ? `<rect x="${x + largura - 30}" y="${y + 8}" width="22" height="3" fill="#c62828"/>
    <rect x="${x + largura - 30}" y="${y + 14}" width="22" height="3" fill="#c62828"/>` : ''}`;
}

function blister(cor) {
  let bolhas = '';
  for (let linha = 0; linha < 2; linha++) {
    for (let coluna = 0; coluna < 4; coluna++) {
      bolhas += `<ellipse cx="${26 + coluna * 20}" cy="${22 + linha * 26}" rx="7" ry="10" fill="${clarear(cor, 0.7)}" stroke="#c9ced6"/>`;
    }
  }
  return `
    <g transform="translate(108 40) rotate(12)">
      <rect x="0" y="0" width="96" height="74" rx="6" fill="#e9ecf1" stroke="#c9ced6"/>
      ${bolhas}
    </g>`;
}

function frasco(p) {
  const cor = p.cor;
  return `
    <rect x="84" y="20" width="32" height="20" rx="4" fill="${clarear(cor, -0.3)}"/>
    <rect x="92" y="10" width="16" height="14" rx="4" fill="${clarear(cor, -0.45)}"/>
    <rect x="88" y="38" width="24" height="10" fill="#d9a35b"/>
    <rect x="66" y="46" width="68" height="96" rx="14" fill="#c9893a"/>
    <rect x="72" y="52" width="10" height="80" rx="5" fill="#e3b072" opacity="0.7"/>
    <rect x="66" y="70" width="68" height="54" fill="#ffffff"/>
    <rect x="66" y="70" width="68" height="8" fill="${cor}"/>
    <text x="100" y="96" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-weight="900" font-size="${p.nome.length > 8 ? 11 : 13}" fill="${cor}">${escaparSvg(p.nome)}</text>
    <text x="100" y="108" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="7" fill="#5f6b7a">${escaparSvg(p.dosagem)}</text>
    <text x="100" y="118" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-weight="700" font-size="7" fill="${cor}">${escaparSvg(p.quantidade)}</text>`;
}

function desenharEmbalagem(p) {
  let conteudo;
  if (p.forma === 'frasco') conteudo = frasco(p);
  else if (p.forma === 'blister') conteudo = blister(p.cor) + caixa(p, 26, 40, 112, 92);
  else conteudo = caixa(p);

  return `
    <svg viewBox="0 0 200 160" role="img" aria-label="Embalagem de ${escaparSvg(p.nome)}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="146" rx="70" ry="6" fill="rgba(0,0,0,0.08)"/>
      ${conteudo}
    </svg>`;
}

window.desenharEmbalagem = desenharEmbalagem;
