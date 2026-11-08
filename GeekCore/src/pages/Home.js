import { useState, useEffect } from 'react';
import { contentService } from '../services/api';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Row, RowSkeleton } from '../components/Row';

const NOMES_CATEGORIA = {
  shonen: 'Shonen: ação e amizade',
  'ação': 'Ação e aventura',
  drama: 'Drama',
  fantasia: 'Fantasia',
  suspense: 'Suspense e mistério',
  'ficção científica': 'Ficção científica',
  terror: 'Terror',
  'comédia': 'Comédia',
  'animação': 'Animação',
  romance: 'Romance',
};

function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

export function Home() {
  const [recentes, setRecentes] = useState([]);
  const [destaques, setDestaques] = useState([]);
  const [fileiras, setFileiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    try {
      setLoading(true);
      setErro(null);
      const [itensRecentes, categorias] = await Promise.all([
        contentService.getRecentContent(),
        contentService.getCategories(),
      ]);
      if (!itensRecentes.length) {
        setErro('Não foi possível carregar o catálogo. A API pode estar iniciando; tente de novo em alguns segundos.');
        return;
      }
      setRecentes(itensRecentes);

      // Destaques: até 6 títulos, priorizando os que têm imagem de capa
      const comCapa = embaralhar(itensRecentes.filter((i) => i.img_capa_url));
      const semCapa = embaralhar(itensRecentes.filter((i) => !i.img_capa_url));
      setDestaques([...comCapa, ...semCapa].slice(0, 6));

      const porCategoria = await Promise.all(
        categorias.map(async (c) => ({ categoria: c, itens: await contentService.getByCategory(c) }))
      );
      setFileiras(
        porCategoria
          .filter((f) => f.itens.length >= 2)
          .sort((a, b) => b.itens.length - a.itens.length)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  return (
    <div className="gc-page">
      <main className="animate-fadeIn">
        {erro ? (
          <div className="gc-container" style={{ paddingTop: 140, textAlign: 'center' }}>
            <p className="gc-section-sub" style={{ margin: '0 0 16px' }}>{erro}</p>
            <button type="button" className="gc-btn" onClick={carregar}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <Hero items={destaques} />
            <div className="gc-container" style={{ marginTop: -24, position: 'relative', zIndex: 2 }}>
              {loading && !recentes.length ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : (
                <>
                  <Row title="Adicionados recentemente" items={recentes} />
                  {fileiras.map((f) => (
                    <Row
                      key={f.categoria}
                      title={NOMES_CATEGORIA[f.categoria.toLowerCase()] || f.categoria.charAt(0).toUpperCase() + f.categoria.slice(1)}
                      items={f.itens}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
