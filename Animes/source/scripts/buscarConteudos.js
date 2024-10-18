function buscarRelacionados(genero, idAtual) {

    const relacionadosList = document.getElementById('relacionados-list');
    relacionadosList.innerHTML = ''; // Limpa a lista de relacionados

    let count = 0; // Para limitar a 5 cards

    // Busca animes relacionados
    db.collection('animes').where('genero', '==', genero).get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                if (doc.id !== idAtual && count < 5) { // Verifica se não é o conteúdo atual e se ainda não passou de 5
                    const anime = { ...doc.data(), id: doc.id };
                    relacionadosList.innerHTML += exibirConteudo(anime, true);
                    count++;
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
                if (doc.id !== idAtual && count < 5) { // Mesma lógica para filmes
                    const filme = { ...doc.data(), id: doc.id };
                    relacionadosList.innerHTML += exibirConteudo(filme, false);
                    
                    count++;
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar filmes relacionados:', error);
        });
}

