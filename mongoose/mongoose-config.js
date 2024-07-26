// ================ BDD ============== //
// Importer mongoose
const mongoose = require('mongoose');

function initMongoConnection() {
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
}

// Exporter la connexion mongodb
module.exports = initMongoConnection;