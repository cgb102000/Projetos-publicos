import { db } from './firebaseConfig.js';
import { capitalizarPrimeiraLetra } from './utils.js';

function buscarConteudos() {
    const nomeConteudo = document.getElementById('nome-anime').value.toLowerCase().trim();
    const animeList = document.getElementById('anime-list');
    const relacionadosList = document.getElementById('relacionados-list');
    
    animeList.innerHTML = '';
    relacionadosList.innerHTML = ''; // Limpa a seção de relacionados

    // Função interna para exibir conteúdo
    function exibirConteudo(conteudo, isAnime) {
        const descricao = conteudo.descricao || 'Descrição não disponível';
        const genero = conteudo.genero || 'Não especificado';
        const dataLancamento = conteudo.data_lancamento || 'Data não disponível';
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card shadow-sm">
                    <img src="${conteudo.imagem_url}" class="card-img-top" alt="${conteudo.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${capitalizarPrimeiraLetra(conteudo.nome)}</h5>
                        <p class="card-text">${descricao}</p>
                        <p class="card-text"><small class="text-muted">Gênero: ${genero}</small></p>
                        <p class="card-text"><small class="text-muted">Lançamento: ${dataLancamento}</small></p>
                        <a href="detalhes.html?id=${conteudo.id}" class="btn btn-primary">Leia mais</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Busca na coleção de animes
    db.collection('animes').get()
        .then(snapshot => {
            let found = false;

            snapshot.docs.forEach(doc => {
                const anime = { ...doc.data(), id: doc.id };
                if (anime.nome.toLowerCase().includes(nomeConteudo)) {
                    found = true;
                    animeList.innerHTML += exibirConteudo(anime, true);
                    buscarRelacionados(anime.genero, doc.id); // Buscar conteúdos relacionados
                }
            });

            // Busca na coleção de filmes
            db.collection('filmes').get()
                .then(snapshotFilmes => {
                    snapshotFilmes.docs.forEach(doc => {
                        const filme = { ...doc.data(), id: doc.id };
                        if (filme.nome.toLowerCase().includes(nomeConteudo)) {
                            found = true;
                            animeList.innerHTML += exibirConteudo(filme, false);
                            buscarRelacionados(filme.genero, doc.id); // Buscar conteúdos relacionados
                        }
                    });

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

// Função para buscar conteúdos relacionados
function buscarRelacionados(genero, idAtual) {
    const relacionadosList = document.getElementById('relacionados-list');

    // Busca animes relacionados
    db.collection('animes').where('genero', '==', genero).get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                const anime = { ...doc.data(), id: doc.id };
                if (doc.id !== idAtual) {
                    relacionadosList.innerHTML += exibirConteudo(anime, true);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar animes relacionados:', error);
        });

    // Busca filmes relacionados
    db.collection('filmes').where('genero', '==', genero).get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                const filme = { ...doc.data(), id: doc.id };
                if (doc.id !== idAtual) {
                    relacionadosList.innerHTML += exibirConteudo(filme, false);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar filmes relacionados:', error);
        });
}

export { buscarConteudos };
 