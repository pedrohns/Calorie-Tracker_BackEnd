const createConnection = require('../utils/sqlConnect')
const readFile = require('../utils/readFile')
let sql = require('../utils/sql')
const consts = require('../consts')
var fetch = require('node-fetch')
var connectionBank = createConnection()
var calorieDao = new sql(connectionBank)
require('dotenv').config()

module.exports = function (app) {
  app.get("/createListFoodFatSecret", async function (req, response) {
    let counter = 10;
    let isFinished = false;
    for (let index = 0; index < counter; index++) {
      let data = await fetch(consts.path, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${consts.token}`
        }, method: 'POST'
      })
      let url = await data.json()
      if (url.foods_search.results != undefined) {
        isFinished = await extractDesiredValuesFatSecret(url.foods_search.results.food, index, counter)
        if (isFinished == true) {
          response.status(200).send('Término da lista de comidas')
          process.exit()
        } else {
          continue;
        }
      } else {
        response.status(200).send('Erro no token ou não possui resultados')
        process.exit();
      }
    }
  })

  app.get("/createListFood", async function (req, response) {
    const counter = 190;
    const promises = [];
    for (let index = 171; index < counter; index++) {
      promises.push(
        fetch(`https://api.nal.usda.gov/fdc/v1/foods/list?api_key=${process.env.CALORIE_KEY}&pageNumber=${index}&pageSize=50`, {
          headers: {
            Accept: "application/json"
          }, method: 'GET'
        })
          // .then(res => res.json())
          .then(res => {
            if (!res.ok) { // Se o status não for 200, rejeite a promessa
              throw new Error(`Error with request: ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
      );
    }

    try {
      const results = await Promise.all(promises);
      const extractedData = results.flatMap(data => extractDesiredValues(data));

      // Após coletar todos os dados, enviar a resposta
      response.send({ ok: "Deu certo" });
    } catch (error) {
      console.error("Erro ao processar requisições:", error);
      response.status(500).send({ error: error.toString() });
    }
  });

  app.get("/createFullListFood", async function (req, response) {
    const extractedData = await readFile();
    //console.log(extractedData)
    if (!!extractedData) {
      response.send({ extractedData })
      extractedData.map((values) => {
        insertData(values)
      })
    }


  });

  app.get("/sendListFood", async function (req, res) {
    let response = await searchData(req.query);
    res.status(200).send({ food: response });
  });

  async function extractDesiredValuesFatSecret(data, idx, counter) {
    if (!Array.isArray(data)) {
      console.warn('Não é um array:', typeof data)
      return false;
    }

    const extractedData = data.map(item => ({
      fdcId: item.food_id,
      description: item.food_name,
      protein: item.servings.serving[0].protein || 0,
      totalLipid: item.servings.serving[0].fat || 0,
      carbohydrate: item.servings.serving[0].carbohydrate || 0,
      energy: item.servings.serving[0].calories || 0,
      fiber: item.servings.serving[0].fiber || 0,
      sugar: item.servings.serving[0].sugar || 0
    }))

    await extractedData.forEach(foodData => {
      insertData(foodData);
    });

    if (counter - idx == 1) {
      return true;
    } else {
      return false;
    }

  }

  async function extractDesiredValues(data) {
    // 204 Fat
    // 205 Carbs
    // 208 Energy
    // 203 Protein
    // 291 Fiber
    // 269 Sugar
    if (!Array.isArray(data)) {
      console.warn('Não é um array:', typeof data)
      return [];
    }
    const extractedData = data.map(item => ({
      fdcId: item.fdcId,
      description: item.description,
      protein: item.foodNutrients.find(nutrient => nutrient.number === "203")?.amount || 0,
      totalLipid: item.foodNutrients.find(nutrient => nutrient.number === "204")?.amount || 0,
      carbohydrate: item.foodNutrients.find(nutrient => nutrient.number === "205")?.amount || 0,
      energy: item.foodNutrients.find(nutrient => nutrient.number === "208")?.amount || 0,
      fiber: item.foodNutrients.find(nutrient => nutrient.number === "291")?.amount || 0,
      sugar: item.foodNutrients.find(nutrient => nutrient.number === "269")?.amount || 0
    }))

    await extractedData.forEach(foodData => {
      insertData(foodData);
    });
    return extractedData;
  }

  async function insertData(data) {
    let description = data.description.replace(/'/g, '')
    let foodId = await firstInsertFood(data.fdcId, description);
    string = `rowid = '${await generateRowid()}',created_by = 'i',last_upd_by = 'i',created = now(),
        last_upd = now(), deleted_by = '', food_id = '${foodId}', quantity_cal = ${data.energy},
        carb = ${data.carbohydrate}, fat = ${data.totalLipid}, protein = ${data.protein},
        fiber = ${data.fiber}, sugar = ${data.sugar} `;
    calorieDao.insert(`insert into ct_food_details set ${string} on duplicate key update food_id = '${foodId}'`);
    // console.log(data)
    // process.exit()  usado como se fosse um die()

  }

  async function generateRowid() {
    var rowid = require('../utils/getRowid')
    return rowid()

  }

  async function firstInsertFood(id, name) {
    foodId = await generateRowid();
    string = `rowid = '${foodId}',created_by = 'i',last_upd_by = 'i',created = now(),last_upd = now(), 
        code = '${id}', name = '${name}', deleted_by = ''`;
    calorieDao.insert(`insert into ct_food set ${string} on duplicate key update code = '${id}'`);
    return foodId;

  }

  async function searchData(data) {
    if (data.search) {
      let result = await calorieDao.select(`select * from ct_food where lower(name) like lower('%${data.search}%')`)
      if (result.length > 0) {
        return result;
      }
      return 'Não achou nada';
    }
    return 'Retornou errado';
  }
}