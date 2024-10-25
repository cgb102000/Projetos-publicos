import { db } from './firebaseConfig.js'; // Importa a configuração do Firebase

// Adiciona o evento de clique ao botão de busca
document.getElementById('btn-buscar').addEventListener('click', realizarBusca);

// Adiciona o evento de tecla ao campo de busca
document.getElementById('nome-anime').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita o comportamento padrão do Enter
        realizarBusca(); // Chama a função de busca
    }
});

// Função que realiza a busca
function realizarBusca() {
    const nomeConteudo = document.getElementById('nome-anime').value.trim(); // Obtém o valor do campo de busca e remove espaços

    if (nomeConteudo === "") {
        // Se o campo estiver vazio, exibe um alerta e não faz nada
        alert('Por favor, insira um nome para buscar.');
        return;
    }

    fetchConteudos(nomeConteudo); // Chama a função com o nome do conteúdo
}

// Função para capitalizar a primeira letra de uma string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Função para buscar animes e filmes
async function fetchConteudos(nomeConteudo) {
    console.log("Buscando conteúdo com o nome:", nomeConteudo);
    const conteudoList = document.getElementById('anime-list');
    conteudoList.innerHTML = ''; // Limpa a lista antes de adicionar

    const exibidos = new Set(); // Para evitar duplicidade na exibição
    let found = false;

    // Busca na coleção de animes
    const snapshotAnimes = await db.collection('animes').get();
    snapshotAnimes.docs.forEach(doc => {
        const anime = doc.data();
        if (anime.nome.toLowerCase().includes(nomeConteudo.toLowerCase()) && !exibidos.has(anime.nome)) {
            found = true;
            conteudoList.innerHTML += exibirConteudo(anime);
            exibidos.add(anime.nome); // Marca como exibido
        }
    });

    // Busca na coleção de filmes
    const snapshotFilmes = await db.collection('filmes').get();
    snapshotFilmes.docs.forEach(doc => {
        const filme = doc.data();
        if (filme.nome.toLowerCase().includes(nomeConteudo.toLowerCase()) && !exibidos.has(filme.nome)) {
            found = true;
            conteudoList.innerHTML += exibirConteudo(filme);
            exibidos.add(filme.nome); // Marca como exibido
        }
    });

    // Mensagem caso nenhum conteúdo seja encontrado
    if (!found) {
        conteudoList.innerHTML = '<p>Nenhum anime ou filme encontrado.</p>';
    } else {
        // Se algum conteúdo foi encontrado, chama a função para buscar aleatórios
        fetchAleatorios();
    }
}

// Função para buscar 5 conteúdos aleatórios
async function fetchAleatorios() {
    const aleatoriosList = document.getElementById('relacionados-list'); // ID da seção de conteúdos relacionados
    aleatoriosList.innerHTML = ''; // Limpa a lista de conteúdos relacionados

    // Busca animes
    const snapshotAnimes = await db.collection('animes').get();
    const animes = snapshotAnimes.docs.map(doc => doc.data());
    
    // Busca filmes
    const snapshotFilmes = await db.collection('filmes').get();
    const filmes = snapshotFilmes.docs.map(doc => doc.data());

    // Junta todos os conteúdos
    const todosConteudos = [...animes, ...filmes];

    // Embaralha os conteúdos
    todosConteudos.sort(() => Math.random() - 0.5);

    // Limita a 5 conteúdos
    const aleatorios = todosConteudos.slice(0, 5);

    // Exibe os conteúdos aleatórios
    aleatorios.forEach(conteudo => {
        aleatoriosList.innerHTML += exibirConteudo(conteudo);
    });

    // Mensagem caso nenhum conteúdo aleatório seja encontrado
    if (aleatoriosList.innerHTML === '') {
        aleatoriosList.innerHTML = '<p>Nenhum conteúdo aleatório encontrado.</p>';
    }
}

// Função auxiliar para exibir os cards
function exibirConteudo(conteudo) {
    return `
        <div class="col-md-4 mb-4">
            <div class="anime-card">
                <img src="${conteudo.imagem_url}" alt="${conteudo.nome}" class="anime-image">
                <h3>${capitalize(conteudo.nome)}</h3>
                <p><strong>Data de Lançamento:</strong> ${conteudo.data_lancamento || 'Data não disponível'}</p>
                <p><strong>Gênero:</strong> ${capitalize(conteudo.genero || 'Não especificado')}</p>
                <p>${capitalize(conteudo.descricao || 'Descrição não disponível')}</p>
                <a href="detalhes.html?titulo=${encodeURIComponent(conteudo.nome)}" class="btn btn-primary">Veja mais</a>
            </div>
        </div>
    `;
}
