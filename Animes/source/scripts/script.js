// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqqkG-GiLKqnVKG0J4GNEOGlF0OXG6_ek",
    authDomain: "teste-8f37b.firebaseapp.com",
    projectId: "teste-8f37b",
    storageBucket: "teste-8f37b.appspot.com",
    messagingSenderId: "556521719102",
    appId: "1:556521719102:web:b41dbaef17c2b3a061d86f",
    measurementId: "G-29YHYCTNLN"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = firebase.firestore();

// Função para capitalizar a primeira letra de uma string
function capitalizarPrimeiraLetra(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função para buscar animes e filmes por nome
function buscarConteudos() {
    const nomeConteudo = document.getElementById('nome-anime').value.toLowerCase().trim();
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = '';

    // Busca na coleção de animes
    db.collection('animes').get()
        .then((snapshot) => {
            let found = false;

            snapshot.docs.forEach(doc => {
                const anime = doc.data();
                const descricao = anime.descricao || 'Descrição não disponível';

                if (anime.nome.toLowerCase().includes(nomeConteudo)) {
                    found = true;
                    animeList.innerHTML += `
                        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                            <div class="card shadow-sm">
                                <img src="${anime.imagem_url}" class="card-img-top" alt="${anime.nome}">
                                <div class="card-body">
                                    <h5 class="card-title">${capitalizarPrimeiraLetra(anime.nome)}</h5>
                                    <p class="card-text">${descricao}</p>
                                    <p class="card-text"><small class="text-muted">Gênero: ${anime.genero || 'Não especificado'}</small></p>
                                    <p class="card-text"><small class="text-muted">Lançamento: ${anime.data_lancamento || 'Data não disponível'}</small></p>
                                    <a href="detalhes.html?id=${doc.id}" class="btn btn-primary">Leia mais</a>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            // Busca na coleção de filmes
            db.collection('filmes').get()
                .then((snapshotFilmes) => {
                    snapshotFilmes.docs.forEach(doc => {
                        const filme = doc.data();
                        const descricao = filme.descricao || 'Descrição não disponível';

                        if (filme.nome.toLowerCase().includes(nomeConteudo)) {
                            found = true;
                            animeList.innerHTML += `
                                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                                    <div class="card shadow-sm">
                                        <img src="${filme.imagem_url}" class="card-img-top" alt="${filme.nome}">
                                        <div class="card-body">
                                            <h5 class="card-title">${capitalizarPrimeiraLetra(filme.nome)}</h5>
                                            <p class="card-text">${descricao}</p>
                                            <p class="card-text"><small class="text-muted">Gênero: ${filme.genero || 'Não especificado'}</small></p>
                                            <p class="card-text"><small class="text-muted">Lançamento: ${filme.data_lancamento || 'Data não disponível'}</small></p>
                                            <a href="detalhes.html?id=${doc.id}" class="btn btn-primary">Leia mais</a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    });

                    // Se nenhum anime ou filme for encontrado
                    if (!found) {
                        animeList.innerHTML = '<p>Nenhum anime ou filme encontrado.</p>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar filmes:', error);
                    animeList.innerHTML = '<p>Ocorreu um erro ao buscar filmes. Tente novamente mais tarde.</p>';
                });
        })
        .catch(error => {
            console.error('Erro ao buscar animes:', error);
            animeList.innerHTML = '<p>Ocorreu um erro ao buscar animes. Tente novamente mais tarde.</p>';
        });
}

// Função para carregar os detalhes do conteúdo
function carregarDetalhes() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // Obtém o ID do conteúdo da URL

    // Busca na coleção de animes
    db.collection('animes').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const anime = doc.data();
                document.getElementById('titulo-detalhes').innerText = capitalizarPrimeiraLetra(anime.nome);
                document.getElementById('descricao-detalhes').innerText = anime.descricao || 'Descrição não disponível';
                document.getElementById('imagem-detalhes').src = anime.imagem_url;
                document.getElementById('lancamento-detalhes').innerText = anime.data_lancamento || 'Data não disponível';
                document.getElementById('genero-detalhes').innerText = anime.genero || 'Gênero não disponível';
                document.getElementById('link-imdb').href = `http://www.imdb.com/title/${id}/plotsummary?ref_=tt_stry_pl`;
                document.getElementById('link-trailer').href = `https://www.youtube.com/watch?v=${anime.trailer_id}`;
            } else {
                // Tenta buscar como filme se o anime não for encontrado
                buscarFilmePorId(id);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar anime:', error);
            alert('Ocorreu um erro ao buscar detalhes do anime. Tente novamente mais tarde.');
        });
}

// Função para buscar filme por ID
function buscarFilmePorId(id) {
    db.collection('filmes').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const filme = doc.data();
                document.getElementById('titulo-detalhes').innerText = capitalizarPrimeiraLetra(filme.nome);
                document.getElementById('descricao-detalhes').innerText = filme.descricao || 'Descrição não disponível';
                document.getElementById('imagem-detalhes').src = filme.imagem_url;
                document.getElementById('lancamento-detalhes').innerText = filme.data_lancamento || 'Data não disponível';
                document.getElementById('genero-detalhes').innerText = filme.genero || 'Gênero não disponível';
                document.getElementById('link-imdb').href = `http://www.imdb.com/title/${id}/plotsummary?ref_=tt_stry_pl`;
                document.getElementById('link-trailer').href = `https://www.youtube.com/watch?v=${filme.trailer_id}`;
            } else {
                console.error('Conteúdo não encontrado');
                alert('Conteúdo não encontrado.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filme:', error);
            alert('Ocorreu um erro ao buscar detalhes do filme. Tente novamente mais tarde.');
        });
}

// Chama a função carregarDetalhes quando a página de detalhes for carregada
if (window.location.pathname.includes('detalhes.html')) {
    carregarDetalhes();
}
