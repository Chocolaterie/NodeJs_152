const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../mongoose/models/mongoose-user');
const helpers = require('../shared/helpers');

// clé secrete jwt
const JWT_SECRET = "chocolatine";

router.post('/login', async (request, response) => {

    // Tester le couple email / mot de passe
    const loggedUser = await User.findOne({ email : request.body.email, password : request.body.password });

    // Si pas bon
    if (!loggedUser){
        return helpers.performResponseService(response, '701', 'Couple email et mot de passe incorrect', null);
    }

    // Se connecter (générer un token)
    const token = jwt.sign({
        email: loggedUser.email,
    }, JWT_SECRET, { expiresIn: '3 hours' })

    // Retourner la réponse json
    return helpers.performResponseService(response, '202', 'Connecté(e) avec succès', token);
});

// EXPORTER LE ROUTER
module.exports = router