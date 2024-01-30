var consts = require('../consts')
var fetch = require('node-fetch')
var foods = require('../utils/foodUtils')
require('dotenv').config()

// var token = consts.getToken();
consts.getToken().then(row => {
    token = row.token;
}).catch(error => {
    console.error(error);
})

module.exports = function (app) {

    app.get("/createListFoodFatSecret", async function (req, res) {
        try {
            let body = req.query.expression;
            let counter = 300;
            let isFinished = false;
            for (let index = 0; index < counter; index++) {

                let response = await createFoodInDB({ isFinished: isFinished, index: index, body: body, counter: counter, maxResults: 50 });
                if (response === true) {
                    res.status(200).send('Término da lista de comidas')
                    // break;
                } else if (response == 'continue') {
                    continue;
                } else {
                    res.status(200).send(response)
                    break;
                }
            }

        } catch (e) {

            console.log('createListFoodFatSecret - ' + e.toString())
            res.status(500).send(`Erro ao processar a solicitação: ${e.toString()}`);
        }

    })


    app.get("/sendListFoodFatSecret", async function (req, res) {
        console.log('SendListFoodFatSecret - Fired');
        try {
            let response = await foods.searchData(req.query.search);
            await res.status(200).send({ food: response });
        } catch (e) {
            console.log('SendListFoodFatSecret - Erro na requisição: ' + e.toString())
            res.status(500).send('Erro na requisição, tente novamente mais tarde.')
        }

    });
    //Primeiro Middleware, sem o autoComplete
    app.get("/getFoodAPI", async function (req, res, next) {
        let body = req.query.search;
        try {
            let realResponse = await createFoodInDB({ isFinished: false, body: body, path: consts.path, counter: 2, index: 1, isSingle: true })
            // console.log(`getFoodAPI1 - retorno do createFoodInDB: ${realResponse}`)
            if (realResponse.toString().includes("Erro") === true) {
                res.status(500).send('Houve um erro na busca dos dados.')
                return;
            } else {
                console.log(`getFoodAPI1 - Veio procurar a comida. ${body}`);

                let response = await foods.searchData(body);

                // console.log(`getFoodAPI1 - Resposta da busca: ${response} `);
                if (response == 'Não achou nada') {
                    next()
                } else {
                    await res.status(200).send({ food: response });
                    return;
                }
            }
        } catch (e) {
            res.status(500).send(`Erro na requisição, tente novamente. ${e.toString()}`)
        }

    })

    //Segundo Middleware
    app.get("/getFoodAPI", async function (req, res) {
        let body = req.query.search;
        try {
            let data = await fetch(consts.pathAutoComplete + `&expression=${body}`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                }, method: 'POST'
            });
            let response = await data.json();
            let arrayResponse = response.suggestions.suggestion;
            let arrayToSend = [];
            console.log(`getFoodAPI2 - Primeiro registro arrayResponse - ${arrayResponse[0]}`)

            for (let i = 0; i < arrayResponse.length; i++) {
                let realResponse = await createFoodInDB({ isFinished: false, body: arrayResponse[i], path: consts.path })
                await console.log(`getFoodAPI2 - retorno do createFoodInDB: ${realResponse}`)

                if (realResponse.toString().includes("Erro") === true) {
                    res.status(500).send('Houve um erro na busca dos dados.')
                    break;
                } else {
                    arrayToSend[i] = arrayResponse[i];
                }
            }
            if (arrayToSend.length > 0) {
                await console.log(`getFoodAPI2 - Veio procurar a comida. ${arrayToSend[0]}`);

                let response = await foods.searchData(arrayToSend[0]);

                await console.log(`getFoodAPI2 - Resposta da busca: ${response} `);

                await res.status(200).send({ food: response });
            }
        } catch (e) {
            res.status(500).send(`Erro na requisição, tente novamente. ${e.toString()}`)
        }

    });

    async function createFoodInDB({ isFinished, index = 0, body = 'teste', counter = 0, maxResults = 15, path = consts.path, isSingle = false } = {}) {
        // console.log('createFoodInDB ' + path + `&page_number=${index}&search_expression=${body}&max_results=${maxResults}`);
        let pageNumber = (isSingle) ? 0 : index;
        let data = await fetch(path + `&page_number=${pageNumber}&search_expression=${body}&max_results=${maxResults}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            }, method: 'POST'
        })
        let url = await data.json()
        // console.log('CreateFoodInDB - return url: '+JSON.stringify(url));
        if (url.foods_search.results != undefined) {
            isFinished = await foods.extractDesiredValuesFatSecret(url.foods_search.results.food, index, counter)
            if (isFinished == true) {
                return isFinished;
            } else {
                return 'continue';
            }
        } else {
            return `Erro no token ou não possui resultados mais resultados. ${index}`;
        }
    }

}