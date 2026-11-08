import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contentService } from '../services/api';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { TIPOS, nomeCategoria, nomeTipo } from '../utils/catalogo';

// Catálogo completo com filtros por tipo (filme/série/anime) e categoria, guardados na URL
export function Explorar() {
  const [params, setParams] = useSearchParams();
  const tipo = params.get('tipo') || '';
  const categoria = params.get('categoria') || '';
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    contentService.getCategories().then(setCategorias);
  }, []);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro(null);
    contentService.getCatalogo({ tipo, categoria })
      .then((dados) => ativo && setItens(dados))
      .catch(() => ativo && setErro('Não foi possível carregar o catálogo. Tente de novo em alguns segundos.'))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [tipo, categoria]);

  const filtrar = (chave, valor) => {
    const novo = new URLSearchParams(params);
    if (valor) novo.set(chave, valor); else novo.delete(chave);
    setParams(novo);
  };

  const titulo = [tipo ? nomeTipo(tipo) : 'Catálogo completo', categoria && nomeCategoria(categoria)].filter(Boolean).join(' · ');

  return (
    <Container>
      <h1 className="gc-section-title" style={{ fontSize: 'clamp(1.5rem, 1.1rem + 1.2vw, 2.1rem)' }}>{titulo}</h1>

      <div className="gc-filtros" role="group" aria-label="Filtrar por tipo">
        <button type="button" className={`gc-filtro${!tipo ? ' ativo' : ''}`} onClick={() => filtrar('tipo', '')}>Tudo</button>
        {TIPOS.map((t) => (
          <button key={t.id} type="button" className={`gc-filtro${tipo === t.id ? ' ativo' : ''}`} onClick={() => filtrar('tipo', t.id)}>
            <span aria-hidden="true">{t.icone}</span> {t.nome}
          </button>
        ))}
      </div>

      <div className="gc-filtros gc-filtros-cat" role="group" aria-label="Filtrar por categoria">
        <button type="button" className={`gc-chip-filtro${!categoria ? ' ativo' : ''}`} onClick={() => filtrar('categoria', '')}>Todas as categorias</button>
        {categorias.map((c) => (
          <button key={c} type="button" className={`gc-chip-filtro${categoria.toLowerCase() === c.toLowerCase() ? ' ativo' : ''}`} onClick={() => filtrar('categoria', c)}>
            {nomeCategoria(c)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="gc-grid">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i}>
              <div className="gc-skel" style={{ aspectRatio: '2 / 3' }} />
              <div className="gc-skel" style={{ height: 14, marginTop: 10, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : erro ? (
        <p className="gc-section-sub">{erro}</p>
      ) : itens.length === 0 ? (
        <div className="gc-panel" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Nenhum título com esses filtros.</p>
          <p className="gc-section-sub" style={{ margin: '6px 0 16px' }}>Tente outra combinação.</p>
          <button type="button" className="gc-btn" onClick={() => setParams(new URLSearchParams())}>Limpar filtros</button>
        </div>
      ) : (
        <>
          <p className="gc-section-sub" style={{ marginTop: 0 }}>{itens.length} {itens.length === 1 ? 'título' : 'títulos'}</p>
          <div className="gc-grid">
            {itens.map((item) => <Card key={item._id} item={item} />)}
          </div>
        </>
      )}
    </Container>
  );
}
