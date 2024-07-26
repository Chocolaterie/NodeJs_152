const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Article = require('../mongoose/models/mongoose-article');
const helpers = require('../shared/helpers');
const middlewares = require('../shared/middlewares');

router.get('/articles', async (request, response) => {

    // Select all d'article
    const articles = await Article.find();

    return helpers.performResponseService(response, '200', 'La liste des articles a été récupérés avec succès', articles);
});

router.get('/article/:id', async (request, response) => {
    // Il faut l'id
    const id = request.params.id;

    // Le code qui retrouve l'article ayant l'attribut id === l'id en param
    const foundArticle = await Article.findOne({ uid : id });

    // RG-002 - 702 Si article inexistant
    if (!foundArticle){
        return helpers.performResponseService(response, '702', `Impossible de récupérer un article avec l'UID ${id}`, null);
    }

    // RG-002 - 200
    return helpers.performResponseService(response, '200', `Article récupéré avec succès`, foundArticle);
});

/**
 * 1 : url
 * 2 : middlewares
 * 3 : le code de la route
 */
router.post('/save-article', middlewares.authMiddleware, async (request, response) => {

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
            return helpers.performResponseService(response, '701', `Impossible modifier un autre article avec un titre déjà existant`, null);
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
        return helpers.performResponseService(response, '200', `Article modifié avec succès`, foundArticle);
    }
    // ------------------------
    // Creation : RG-003
    // ------------------------
    //  RG-003 - 701 : Tester que le titre n'existe pas en base
    const articleByTitle = await Article.findOne({ title : articleJSON.title });
    if (articleByTitle){
        return helpers.performResponseService(response, '701', `Impossible d'ajouter un article avec un titre déjà existant`, null);
    }

    // Intancier un article Mongo
    const createdArticle = await Article.create(articleJSON);

    // Génére un id
    createdArticle.uid = uuidv4();

    // Sauvegarder en base
    await createdArticle.save();

    // Message succès (200)
    return helpers.performResponseService(response, '200', `Article ajouté avec succès`, createdArticle);
});

router.delete('/article/:id', middlewares.authMiddleware, async (request, response) => {

    // Il faut l'id en entier
    const id = request.params.id;

    // trouver un article
    const foundArticle = await Article.findOne({ uid : id });

    // RG-005 : 702 si article non trouvé erreur
    if (!foundArticle) {
        return helpers.performResponseService(response, '702', `Impossible de supprimer un article dont l'UID n'existe pas`, null);
    }

    // supprimer grace à l'index
    await foundArticle.deleteOne();
    
    // 200
    return helpers.performResponseService(response, '200', `L'article ${id} a été supprimé avec succès`, foundArticle);
});

// EXPORTER LE ROUTER
module.exports = router