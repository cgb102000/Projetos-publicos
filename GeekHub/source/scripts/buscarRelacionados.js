// Função para buscar conteúdos relacionados
async function buscarRelacionados(genero) {
    const animesRef = db.collection('animes');
    const filmesRef = db.collection('filmes');

    const animesRelacionados = await animesRef.where('genero', '==', genero).limit(5).get();
    const filmesRelacionados = await filmesRef.where('genero', '==', genero).limit(5).get();

    const relacionados = [];

    animesRelacionados.forEach(doc => {
        relacionados.push({ id: doc.id, ...doc.data() });
    });

    filmesRelacionados.forEach(doc => {
        relacionados.push({ id: doc.id, ...doc.data() });
    });

    // Renderiza os conteúdos relacionados
    renderizarRelacionados(relacionados);
}

// Função para renderizar os conteúdos relacionados
function renderizarRelacionados(relacionados) {
    // Renderize os conteúdos relacionados aqui
}
