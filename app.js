const express = require('express');

const app = express();

// Routes
app.get('/articles', (request, response) => {

    return response.json('Retournera la liste des articles');
});

app.get('/article/:id', (request, response) => {

    const id = request.params.id;

    return response.json(`Retournera l'article ${id}`);
});

app.post('/save-article', (request, response) => {

    return response.json(`Va créer/mettre à jour un article envoyé`);
});

app.delete('/article/:id', (request, response) => {

    const id = request.params.id;

    return response.json(`Supprimera un article id ${id}`);
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log(`le serveur à démarré`);
});