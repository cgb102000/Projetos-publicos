import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';

// Fileira horizontal de cards com rolagem por arrasto/toque e setas no desktop
export function Row({ title, subtitle, items, link }) {
  const trackRef = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const atualizarSetas = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    atualizarSetas();
    window.addEventListener('resize', atualizarSetas);
    return () => window.removeEventListener('resize', atualizarSetas);
  }, [items, atualizarSetas]);

  if (!items?.length) return null;

  const rolar = (direcao) => {
    const el = trackRef.current;
    el.scrollBy({ left: direcao * el.clientWidth * 0.85 });
  };

  return (
    <section className="gc-section">
      <div className="gc-row-cabecalho">
        <h2 className="gc-section-title">{title}</h2>
        {link && <Link to={link} className="gc-ver-tudo">Ver tudo <span aria-hidden="true">→</span></Link>}
      </div>
      {subtitle && <p className="gc-section-sub">{subtitle}</p>}
      <div className="gc-row">
        {podeVoltar && (
          <button type="button" className="gc-row-btn esq" onClick={() => rolar(-1)} aria-label={`Voltar em ${title}`}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="gc-row-track" ref={trackRef} onScroll={atualizarSetas}>
          {items.map((item) => <Card key={item._id} item={item} />)}
        </div>
        {podeAvancar && (
          <button type="button" className="gc-row-btn dir" onClick={() => rolar(1)} aria-label={`Avançar em ${title}`}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </section>
  );
}

export function RowSkeleton({ count = 7 }) {
  return (
    <section className="gc-section">
      <div className="gc-skel" style={{ width: 220, height: 24, marginBottom: 16 }} />
      <div className="gc-row-track" style={{ overflow: 'hidden' }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <div className="gc-skel" style={{ aspectRatio: '2 / 3' }} />
            <div className="gc-skel" style={{ height: 14, marginTop: 10, width: '80%' }} />
          </div>
        ))}
      </div>
    </section>
  );
}
