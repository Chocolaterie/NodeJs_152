const express = require('express');

const app = express();
// Autoriser express à recevoir des donnée envoyer en JSOn dans le body (Le fameux Payload)
app.use(express.json());

// Init la connection
const initMongoConnection = require('./mongoose/mongoose-config');
initMongoConnection();

// Routes
const articleRouter = require('./routes/article-routes');
app.use(articleRouter);

const authRouter = require('./routes/auth-routes');
app.use(authRouter);

// Démarrer le serveur
app.listen(3000, () => {
    console.log(`le serveur à démarré`);
});