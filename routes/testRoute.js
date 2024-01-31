require('dotenv').config()

module.exports = function (app) {
    app.get("/", async function (req, response) {
        response.status(200).send('Servido está rodando corretamente!!!')
    })
}