// Função para buscar todos os conteúdos das coleções "Filmes" e "Animes"
async function buscarConteudos(termo) {
    const animesRef = db.collection('Animes');
    const filmesRef = db.collection('Filmes');
    let resultados = [];

    // Buscar em "Animes"
    const querySnapshotAnimes = await animesRef.get();
    querySnapshotAnimes.forEach((doc) => {
        const dados = doc.data();
        if (dados.nome.toLowerCase().includes(termo.toLowerCase())) {
            resultados.push({ ...dados, id: doc.id, tipo: 'anime' });
        }
    });

    // Buscar em "Filmes"
    const querySnapshotFilmes = await filmesRef.get();
    querySnapshotFilmes.forEach((doc) => {
        const dados = doc.data();
        if (dados.nome.toLowerCase().includes(termo.toLowerCase())) {
            resultados.push({ ...dados, id: doc.id, tipo: 'filme' });
        }
    });

    return resultados;
}

// Função para exibir o conteúdo na tela
function exibirConteudos(resultados) {
    const lista = document.getElementById('resultados-lista');
    lista.innerHTML = ''; // Limpa os resultados anteriores

    resultados.forEach((conteudo) => {
        const card = criarCard(conteudo);
        lista.appendChild(card);
    });
}

// Função para criar um card de conteúdo
function criarCard(conteudo) {
    const card = document.createElement('div');
    card.classList.add('anime-card');

    const titulo = document.createElement('h2');
    titulo.textContent = conteudo.nome;
    card.appendChild(titulo);

    const descricao = document.createElement('p');
    descricao.textContent = conteudo.descricao;
    card.appendChild(descricao);

    const link = document.createElement('a');
    link.href = `detalhes.html?id=${conteudo.id}&tipo=${conteudo.tipo}`;
    link.textContent = 'Leia Mais';
    card.appendChild(link);

    return card;
}

// Função para buscar e exibir conteúdos relacionados com base no gênero
async function buscarConteudosRelacionados(genero) {
    const animesRef = db.collection('Animes');
    const filmesRef = db.collection('Filmes');
    let relacionados = [];

    // Buscar conteúdos relacionados em "Animes"
    const querySnapshotAnimes = await animesRef.where('genero', '==', genero).limit(5).get();
    querySnapshotAnimes.forEach((doc) => {
        relacionados.push({ ...doc.data(), id: doc.id, tipo: 'anime' });
    });

    // Buscar conteúdos relacionados em "Filmes"
    const querySnapshotFilmes = await filmesRef.where('genero', '==', genero).limit(5).get();
    querySnapshotFilmes.forEach((doc) => {
        relacionados.push({ ...doc.data(), id: doc.id, tipo: 'filme' });
    });

    exibirConteudosRelacionados(relacionados);
}

// Função para exibir os conteúdos relacionados na tela
function exibirConteudosRelacionados(relacionados) {
    const relacionadosLista = document.getElementById('relacionados-lista');
    relacionadosLista.innerHTML = ''; // Limpa os conteúdos relacionados anteriores

    relacionados.forEach((conteudo) => {
        const card = criarCard(conteudo);
        relacionadosLista.appendChild(card);
    });
}

// Função principal para lidar com a busca
document.getElementById('buscar-btn').addEventListener('click', async () => {
    const termo = document.getElementById('buscar-input').value.trim(); // Remove espaços em branco

    // Se o campo de busca estiver vazio, não faz nada
    if (termo === "") {
        return; // Sai da função se o termo estiver vazio
    }

    const resultados = await buscarConteudos(termo);

    exibirConteudos(resultados);

    // Se houver resultados, buscar conteúdos relacionados pelo gênero do primeiro resultado
    if (resultados.length > 0) {
        const genero = resultados[0].genero;
        await buscarConteudosRelacionados(genero);
    } else {
        document.getElementById('relacionados-lista').innerHTML = ''; // Limpar se não houver resultados
    }
});
