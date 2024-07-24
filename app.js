const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
// Autoriser express à recevoir des donnée envoyer en JSOn dans le body (Le fameux Payload)
app.use(express.json());

// ================ BDD ============== //
// Importer mongoose
const mongoose = require('mongoose');

// Ecouter quand la connexion success
mongoose.connection.once('open', () => {
    console.log(`Connecté à la base de données`);
});

// Ecouter quand la connexion plante
mongoose.connection.on('error', (err) => {
    console.log(`Erreur de base de données : ${err}`);
});

// Se connecter à mongo db
mongoose.connect("mongodb://localhost:27017/db_article");

// Déclarer le modele Person
// 1 : Nom pour les relations dans le code JS (on utilise pas pour le moment)
// 2 : Les attributs attendus pour ce Model
// 3 : Le nom de la collection en base liée (synonyme du nom de la table en sql)
const Article = mongoose.model('Article', { uid: String, title : String, content : String, author: String }, 'articles');

// ================ BDD ============== //

// MOCK
// Simulation de données en mémoire
let DB_Articles = [
    { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
    { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
    { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];

// Routes
app.get('/articles', async (request, response) => {

    // Select all d'article
    const articles = await Article.find();

    return response.json(articles);
});

app.get('/article/:id', async (request, response) => {

    // Il faut l'id
    const id = request.params.id;

    // Le code qui retrouve l'article ayant l'attribut id === l'id en param
    const foundArticle = await Article.findOne({ uid : id });

    return response.json(foundArticle);
});

app.post('/save-article', async (request, response) => {

    // Récupérer l'article envoyé en json
    const articleJSON = request.body;

    let foundArticle = null;
    // ------------------------
    // EDITION 
    // ------------------------
    // Est-ce on a un id envoyer dans le json
    if (articleJSON.id != undefined || articleJSON.id) {
        // essayer de trouver un article existant
        foundArticle = await Article.findOne({uid : articleJSON.id});
    
        // Si je trouve pas l'article à modifier
        if (!foundArticle) {
            return response.json("Impossible de modifié un article inexistant")
        }

        // Mettre à jour les attributs
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        // Sauvegarder en base
        await foundArticle.save();

        // Retourner message succès
        return response.json(`L'article a été modifié avec succès`);
    }
    // ------------------------
    // Creation 
    // ------------------------
    // Intancier un article Mongo
    const createdArticle = await Article.create(articleJSON);

    // Génére un id
    createdArticle.uid = uuidv4();

    // Sauvegarder en base
    await createdArticle.save();

    // Message succès
    return response.json(`Article crée avec succès !`);
});

app.delete('/article/:id', async (request, response) => {

    // Il faut l'id en entier
    const id = request.params.id;

    // trouver un article
    const foundArticle = await Article.findOne({ uid : id });

    // si article non trouvé erreur
    if (!foundArticle) {
        return response.json(`Impossible de supprimer un article inexistant`);
    }

    // supprimer grace à l'index
    await foundArticle.deleteOne();

    return response.json(`Article supprimé ${id}`);
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log(`le serveur à démarré`);
});