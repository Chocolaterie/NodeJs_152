const express = require('express');

const app = express();
// Autoriser express à recevoir des donnée envoyer en JSOn dans le body (Le fameux Payload)
app.use(express.json());

// MOCK
// Simulation de données en mémoire
let DB_Articles = [
    { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
    { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
    { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];

// Routes
app.get('/articles', (request, response) => {

    return response.json(DB_Articles);
});

app.get('/article/:id', (request, response) => {

    // Il faut l'id en entier
    const id = parseInt(request.params.id);

    // Le code qui retrouve l'article ayant l'attribut id === l'id en param
    const foundArticle = DB_Articles.find(article => article.id === id);

    return response.json(foundArticle);
});

app.post('/save-article', (request, response) => {

    // Récupérer l'article envoyé en json
    const articleJSON = request.body;

    let foundArticle = null;
    // Est-ce on a un id envoyer dans le json
    if (articleJSON.id != undefined || articleJSON.id) {
        // essayer de trouver un article existant
        foundArticle = DB_Articles.find(article => article.id === articleJSON.id);
    }

    // Si je trouve je modifie les nouvelles valeurs
    if (foundArticle) {
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        return response.json(`L'article a été modifié avec succès`);
    }

    // Sinon par défaut je créer
    DB_Articles.push(articleJSON);

    return response.json(`Article crée avec succès !`);
});

app.delete('/article/:id', (request, response) => {

    // Il faut l'id en entier
    const id = parseInt(request.params.id);

    // trouver l'index
    const foundArticleIndex = DB_Articles.findIndex(article => article.id === id);

    // si article trouve erreur
    if (foundArticleIndex < 0) {
        return response.json(`Impossible de supprimer un article inexistant`);
    }

    // supprimer grace à l'index
    DB_Articles.slice(foundArticleIndex, 1);

    return response.json(`Supprimera un article id ${id}`);
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log(`le serveur à démarré`);
});