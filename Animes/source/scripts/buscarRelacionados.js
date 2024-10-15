// Função para buscar animes
async function fetchAnimes(nomeAnime) {
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = ''; // Limpa a lista antes de adicionar

    try {
        // Obtém todos os animes
        const snapshot = await db.collection('animes').get();

        // Filtra os animes com base no nome fornecido, independente de maiúsculas/minúsculas
        const matchingAnimes = snapshot.docs.filter(doc => {
            const anime = doc.data();
            return anime.nome.toLowerCase().includes(nomeAnime.toLowerCase()); // Verifica se o nome contém a busca
        });

        // Adiciona os animes correspondentes à lista
        matchingAnimes.forEach(doc => {
            const anime = doc.data();
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="anime-card" onclick="buscarRelacionados('${anime.genero}', '${doc.id}')"> <!-- Adiciona um evento de clique -->
                    <img src="${anime.imagem_url}" alt="${anime.nome}" class="anime-image">
                    <h3>${anime.nome}</h3>
                    <p>${anime.descricao}</p>
                </div>
            `;
            animeList.appendChild(card);
        });

        // Mensagem caso nenhum anime seja encontrado
        if (matchingAnimes.length === 0) {
            animeList.innerHTML = '<p>Nenhum anime encontrado.</p>'; 
        }
    } catch (error) {
        console.error('Erro ao buscar animes:', error);
        animeList.innerHTML = '<p>Erro ao buscar animes. Tente novamente mais tarde.</p>';
    }
}

// Função para buscar conteúdos relacionados
function buscarRelacionados(genero, idAtual) {
    const relacionadosList = document.getElementById('relacionados-list');

    // Limpa a lista de relacionados antes de adicionar novos
    relacionadosList.innerHTML = '';

    // Função interna para processar e exibir os resultados
    const processResults = (snapshot, isAnime) => {
        if (snapshot.empty) {
            relacionadosList.innerHTML += `<p>Nenhum ${isAnime ? 'anime' : 'filme'} relacionado encontrado.</p>`; // Mensagem caso não encontre
        } else {
            snapshot.docs.forEach(doc => {
                const item = { ...doc.data(), id: doc.id };
                if (doc.id !== idAtual) {
                    relacionadosList.innerHTML += exibirConteudo(item, isAnime);
                }
            });
        }
    };

    // Busca animes relacionados
    db.collection('animes').where('genero', '==', genero).get()
        .then(snapshot => processResults(snapshot, true))
        .catch(error => {
            console.error('Erro ao buscar animes relacionados:', error);
            relacionadosList.innerHTML += '<p>Erro ao buscar animes relacionados. Tente novamente mais tarde.</p>';
        });

    // Busca filmes relacionados
    db.collection('filmes').where('genero', '==', genero).get()
        .then(snapshot => processResults(snapshot, false))
        .catch(error => {
            console.error('Erro ao buscar filmes relacionados:', error);
            relacionadosList.innerHTML += '<p>Erro ao buscar filmes relacionados. Tente novamente mais tarde.</p>';
        });
}

// Função para exibir conteúdos (anime/filme)
function exibirConteudo(item, isAnime) {
    return `
        <div class="anime-card">
            <img src="${item.imagem_url}" alt="${item.nome}" class="anime-image">
            <h3>${item.nome}</h3>
            <p>${item.descricao}</p>
        </div>
    `;
}
