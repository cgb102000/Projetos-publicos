import { db } from './firebaseConfig.js'; // Importa a configuração do Firebase

// Função para capitalizar a primeira letra de uma string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Função para buscar animes
async function fetchAnimes(nomeAnime) {
    console.log("Buscando animes com o nome:", nomeAnime); // Log para verificar o que está sendo buscado
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = ''; // Limpa a lista antes de adicionar

    // Obtém todos os animes
    const snapshot = await db.collection('animes').get();
    console.log("Snapshot de animes obtido:", snapshot.docs.length); // Log para verificar a quantidade de animes no banco

    // Filtra os animes com base no nome fornecido
    const matchingAnimes = snapshot.docs.filter(doc => {
        const anime = doc.data();
        return anime.nome.toLowerCase().includes(nomeAnime.toLowerCase());
    });

    console.log("Animes encontrados:", matchingAnimes.length); // Log para verificar a quantidade de animes encontrados

    // Adiciona os animes correspondentes à lista
    matchingAnimes.forEach(doc => {
        const anime = doc.data();
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="anime-card" onclick="buscarRelacionados('${anime.genero}', '${doc.id}')">
                <img src="${anime.imagem_url}" alt="${anime.nome}" class="anime-image">
                <h3>${capitalize(anime.nome)}</h3>
                <p><strong>Data de Lançamento:</strong> ${anime.data_lancamento}</p> <!-- Exibe a data de lançamento -->
                <p><strong>Gênero:</strong> ${capitalize(anime.genero)}</p> <!-- Exibe o gênero -->
                <p>${capitalize(anime.descricao)}</p>
            </div>
        `;
        animeList.appendChild(card);
    });

    // Mensagem caso nenhum anime seja encontrado
    if (matchingAnimes.length === 0) {
        animeList.innerHTML = '<p>Nenhum anime encontrado.</p>'; 
    }
}

// Adiciona o evento de clique ao botão de busca
document.getElementById('btn-buscar').addEventListener('click', function() {
    const nomeAnime = document.getElementById('nome-anime').value; // Obtém o valor do campo de busca
    fetchAnimes(nomeAnime); // Chama a função com o nome do anime
});

// Função para buscar conteúdos relacionados
function buscarRelacionados(genero, idAtual) {
    console.log("Buscando relacionados para gênero:", genero); // Log para verificar o gênero
    const relacionadosList = document.getElementById('relacionados-list');
    relacionadosList.innerHTML = ''; // Limpa a lista de relacionados antes de adicionar novos

    // Busca animes relacionados
    db.collection('animes').where('genero', '==', genero).get()
        .then(snapshot => {
            console.log("Snapshot de relacionados obtido:", snapshot.docs.length); // Log para verificar a quantidade de relacionados
            if (snapshot.empty) {
                relacionadosList.innerHTML += '<p>Nenhum anime relacionado encontrado.</p>'; // Mensagem caso não encontre animes
            } else {
                // Adiciona o anime atual à lista de relacionados
                snapshot.docs.forEach(doc => {
                    const anime = { ...doc.data(), id: doc.id };
                    if (doc.id === idAtual) {
                        // Exibe o anime selecionado na lista de relacionados
                        relacionadosList.innerHTML += exibirConteudo(anime, true);
                    } else {
                        relacionadosList.innerHTML += exibirConteudo(anime, true);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar animes relacionados:', error);
        });

    // Busca filmes relacionados
    db.collection('filmes').where('genero', '==', genero).get()
        .then(snapshot => {
            if (snapshot.empty) {
                relacionadosList.innerHTML += '<p>Nenhum filme relacionado encontrado.</p>'; // Mensagem caso não encontre filmes
            } else {
                snapshot.docs.forEach(doc => {
                    const filme = { ...doc.data(), id: doc.id };
                    if (doc.id !== idAtual) {
                        relacionadosList.innerHTML += exibirConteudo(filme, false);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filmes relacionados:', error);
        });
}

// Função para exibir conteúdos (anime/filme)
function exibirConteudo(item, isAnime) {
    return `
        <div class="anime-card">
            <img src="${item.imagem_url}" alt="${item.nome}" class="anime-image">
            <h3>${capitalize(item.nome)}</h3>
            <p><strong>Data de Lançamento:</strong> ${item.data_lancamento}</p> <!-- Exibe a data de lançamento -->
            <p><strong>Gênero:</strong> ${capitalize(item.genero)}</p> <!-- Exibe o gênero -->
            <p>${capitalize(item.descricao)}</p>
        </div>
    `;
}
