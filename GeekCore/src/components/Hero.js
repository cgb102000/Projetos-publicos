import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const INTERVALO = 7000;

// Banner rotativo da página inicial. Usa a imagem de capa quando existe;
// sem ela, mostra o pôster sobre um fundo desfocado do próprio pôster.
export function Hero({ items }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = items?.length || 0;

  useEffect(() => {
    if (total < 2 || pausado) return undefined;
    const timer = setTimeout(() => setAtual((i) => (i + 1) % total), INTERVALO);
    return () => clearTimeout(timer);
  }, [atual, total, pausado]);

  if (!total) return <div className="gc-hero gc-skel" style={{ borderRadius: 0 }} />;

  const item = items[atual];
  const temCapa = Boolean(item.img_capa_url);
  const ir = (passo) => setAtual((i) => (i + passo + total) % total);

  return (
    <section
      className="gc-hero"
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <img
        key={item._id + '-bg'}
        className={`gc-hero-bg${temCapa ? '' : ' desfocado'}`}
        src={temCapa ? item.img_capa_url : item.img_url}
        alt=""
        onError={(e) => { e.target.onerror = null; e.target.src = item.img_url; e.target.classList.add('desfocado'); }}
      />
      {!temCapa && item.img_url && <img className="gc-hero-poster" src={item.img_url} alt="" />}

      <div className="gc-hero-content">
        <div className="gc-container">
          <div className="inner">
            {item.categoria && <span className="gc-chip gc-chip-primary">{item.categoria}</span>}
            <h1>{item.titulo}</h1>
            {item.descricao && <p>{item.descricao}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to={`/detalhes/videos/${item._id}`} className="gc-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Ver detalhes
              </Link>
            </div>
            {total > 1 && (
              <div className="gc-hero-dots" role="tablist" aria-label="Escolher destaque">
                {items.map((it, i) => (
                  <button
                    key={it._id}
                    type="button"
                    role="tab"
                    aria-selected={i === atual}
                    aria-label={it.titulo}
                    className={i === atual ? 'ativo' : ''}
                    onClick={() => setAtual(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {total > 1 && (
        <>
          <button type="button" className="gc-hero-seta esq" onClick={() => ir(-1)} aria-label="Destaque anterior">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ margin: 'auto' }}><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" className="gc-hero-seta dir" onClick={() => ir(1)} aria-label="Próximo destaque">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ margin: 'auto' }}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </section>
  );
}
