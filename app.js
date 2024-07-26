const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// clé secrete jwt
const JWT_SECRET = "chocolatine";

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
// mongoose.connect("mongodb://localhost:27017/db_article");

// Déclarer le modele Person
// 1 : Nom pour les relations dans le code JS (on utilise pas pour le moment)
// 2 : Les attributs attendus pour ce Model
// 3 : Le nom de la collection en base liée (synonyme du nom de la table en sql)
const Article = mongoose.model('Article', { uid: String, title : String, content : String, author: String }, 'articles');
const User = mongoose.model('User', { email: String, password : String }, 'users');

// ================ BDD ============== //

/**
 * Fonction utilitaire pour retourner une structure de réponse métier
 * @param {*} response 
 * @param {*} code 
 * @param {*} message 
 * @param {*} data 
 * @returns 
 */
function performResponseService(response, code, message, data) {
    return response.json({code : code, message : message, data : data});
}

// Middleware
function authMiddleware(request, response, next){
    // Si token null alors erreur
    if (request.headers.authorization == undefined || !request.headers.authorization) {
        return response.json({ message: "Token null" });
    }

    // Extraire le token (qui est bearer)
    const token = request.headers.authorization.substring(7);

    // par defaut le result est null
    let result = null;
    
    // Si reussi à générer le token sans crash
    try {
        result = jwt.verify(token, JWT_SECRET);
    } catch {
    }

    // Si result null donc token incorrect
    if (!result) {
        return response.json({ message: "token pas bon" });
    }

    // On passe le middleware
    return next();
}

app.get('/todo', async (request, response) => {
    // Retourner la réponse json
    return performResponseService(response, '202', 'Coucou', token);
});

// Routes
app.post('/login', async (request, response) => {

    // Tester le couple email / mot de passe
    const loggedUser = await User.findOne({ email : request.body.email, password : request.body.password });

    // Si pas bon
    if (!loggedUser){
        return performResponseService(response, '701', 'Couple email et mot de passe incorrect', null);
    }

    // Se connecter (générer un token)
    const token = jwt.sign({
        email: loggedUser.email,
    }, JWT_SECRET, { expiresIn: '3 hours' })

    // Retourner la réponse json
    return performResponseService(response, '202', 'Connecté(e) avec succès', token);
});

app.get('/articles', async (request, response) => {

    // Select all d'article
    const articles = await Article.find();

    return performResponseService(response, '200', 'La liste des articles a été récupérés avec succès', articles);
});

app.get('/article/:id', async (request, response) => {
    // Il faut l'id
    const id = request.params.id;

    // Le code qui retrouve l'article ayant l'attribut id === l'id en param
    const foundArticle = await Article.findOne({ uid : id });

    // RG-002 - 702 Si article inexistant
    if (!foundArticle){
        return performResponseService(response, '702', `Impossible de récupérer un article avec l'UID ${id}`, null);
    }

    // RG-002 - 200
    return performResponseService(response, '200', `Article récupéré avec succès`, foundArticle);
});

/**
 * 1 : url
 * 2 : middlewares
 * 3 : le code de la route
 */
app.post('/save-article', authMiddleware, async (request, response) => {

    // Récupérer l'article envoyé en json
    const articleJSON = request.body;

    let foundArticle = null;
    
    // ------------------------
    // EDITION : RG-004
    // ------------------------
    // Est-ce on a un id envoyer dans le json
    if (articleJSON.id != undefined || articleJSON.id) {
        // RG-004 - 701 Si le titre existe déjà
        const articleByTitle = await Article.findOne({ title : articleJSON.title, uid : { $ne : articleJSON.id } });
        if (articleByTitle){
            return performResponseService(response, '701', `Impossible modifier un autre article avec un titre déjà existant`, null);
        }

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

        // Message succès (200)
        return performResponseService(response, '200', `Article modifié avec succès`, foundArticle);
    }
    // ------------------------
    // Creation : RG-003
    // ------------------------
    //  RG-003 - 701 : Tester que le titre n'existe pas en base
    const articleByTitle = await Article.findOne({ title : articleJSON.title });
    if (articleByTitle){
        return performResponseService(response, '701', `Impossible d'ajouter un article avec un titre déjà existant`, null);
    }

    // Intancier un article Mongo
    const createdArticle = await Article.create(articleJSON);

    // Génére un id
    createdArticle.uid = uuidv4();

    // Sauvegarder en base
    await createdArticle.save();

    // Message succès (200)
    return performResponseService(response, '200', `Article ajouté avec succès`, createdArticle);
});

app.delete('/article/:id', authMiddleware, async (request, response) => {

    // Il faut l'id en entier
    const id = request.params.id;

    // trouver un article
    const foundArticle = await Article.findOne({ uid : id });

    // RG-005 : 702 si article non trouvé erreur
    if (!foundArticle) {
        return performResponseService(response, '702', `Impossible de supprimer un article dont l'UID n'existe pas`, null);
    }

    // supprimer grace à l'index
    await foundArticle.deleteOne();
    
    // 200
    return performResponseService(response, '200', `L'article ${id} a été supprimé avec succès`, foundArticle);
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log(`le serveur à démarré`);
});