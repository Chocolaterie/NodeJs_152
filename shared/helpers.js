module.exports = {

    // Quand on export une fonction qui était écrite :
    // function maFunction() {}
    // ca devient :
    // mafunction : () => {}

    /**
     * Fonction utilitaire pour retourner une structure de réponse métier
     * @param {*} response 
     * @param {*} code 
     * @param {*} message 
     * @param {*} data 
     * @returns 
     */
    performResponseService : (response, code, message, data) => {
        return response.json({code : code, message : message, data : data});
    }
}