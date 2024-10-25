// carregarDetalhes.js
import { db } from './firebaseConfig.js';
import { capitalizarPrimeiraLetra } from './utils.js';

function carregarDetalhes() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

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
                buscarFilmePorId(id);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar anime:', error);
            alert('Ocorreu um erro ao buscar detalhes do anime. Tente novamente mais tarde.');
        });
}

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
                alert('Conteúdo não encontrado.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filme:', error);
            alert('Ocorreu um erro ao buscar detalhes do filme. Tente novamente mais tarde.');
        });
}

export { carregarDetalhes };
