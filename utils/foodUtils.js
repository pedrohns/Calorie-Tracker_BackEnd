const createConnection = require('./sqlConnect')
let sql = require('./sql')
var connectionBank = createConnection()
var calorieDao = new sql(connectionBank)
require('dotenv').config()

const obj = {
    extractDesiredValuesFatSecret: async function (data, idx, counter) {
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
            sugar: item.servings.serving[0].sugar || 0,
            amount: Math.floor(item.servings.serving[0].metric_serving_amount) || 1,
            modifier: item.servings.serving[0].metric_serving_unit,
            gram_weight: item.servings.serving[0].metric_serving_amount || 0
        }))

        // Deixando aqui a resposta, era que o método forEach, não é assíncrono, ou seja, ele mandava a resposta, sem esperar
        for (const foodData of extractedData) {
            // console.log('extractDesiredValuesFatSecret - description: '+foodData.modifier)
            await insertData(foodData);
        }

        if (counter - idx == 1) {
            return true;
        } else {
            return false;
        }

    },
    searchData: async function (search) {
        if (search) {
            let result = await calorieDao.select(`select  f.rowid as 'foodRowid', fd.rowid as 'detailRowid', f.name, fd.quantity_cal, fd.carb, fd.fat, fd.protein, fd.fiber, fd.sugar,
            fp.portion, fp.sizePortion, fp.legend  from ct_food f
            inner join ct_food_details fd on fd.food_id = f.rowid and fd.deleted_by = ''
            inner join ct_food_portion fp on fp.food_id = f.rowid and fp.deleted_by = ''
             where lower(f.name) like lower('%${search}%') and f.deleted_by = ''`)
            if (result.length > 0) {
                return result;
            } else {
                return 'Não achou nada';
            }
        } 
        return 'Retornou errado';
    }
}


async function insertData(data) {
    let description = (data.description != undefined) ? data.description.replace(/'/g, '') : 'sem nome'
    let modifier = (data.modifier != undefined) ? data.modifier.replace(/'/g, '') : 'sem grama'
    let foodId = await firstInsertFood(data.fdcId, description);
    // Second insert Food Details
    string = `rowid = '${await generateRowid()}',created_by = 'i',last_upd_by = 'i',created = now(),
    last_upd = now(), deleted_by = '', food_id = '${foodId}', quantity_cal = ${data.energy},
    carb = ${data.carbohydrate}, fat = ${data.totalLipid}, protein = ${data.protein},
    fiber = ${data.fiber}, sugar = ${data.sugar} `;
    // console.log(`insert into ct_food_details set ${string}`)
    calorieDao.insert(`insert into ct_food_details set ${string} on duplicate key update last_upd = now();`);
    // Last insert Portion
    insertPortion(foodId, data.amount, modifier, data.gram_weight)
}

async function insertPortion(food_id, amount, modifier, gram_weight) {
    let portionId = await generateRowid();
    let stringPortion = `rowid = '${portionId}',created_by = 'i',last_upd_by = 'i',created = now(),last_upd = now(), 
food_id = '${food_id}', portion = ${amount}, deleted_by = '', legend = '${modifier}', sizePortion = '${gram_weight}'`;
    calorieDao.insert(`insert into ct_food_portion set ${stringPortion} on duplicate key update last_upd = now();`)
    // console.log(`insert into ct_food_portion set ${stringPortion}`)
}

async function generateRowid() {
    var rowid = require('./getRowid')
    return rowid()

}

async function firstInsertFood(id, name) {
    foodId = await generateRowid();
    string = `rowid = '${foodId}',created_by = 'i',last_upd_by = 'i',created = now(),last_upd = now(), 
    code = '${id}', name = '${name}', deleted_by = ''`;
    // console.log(`insert into ct_food set ${string}`)
    calorieDao.insert(`insert into ct_food set ${string} on duplicate key update last_upd = now();`);
    // console.log(`insert into ct_food set ${string} on duplicate key update last_upd = now();`);
    return foodId;

}

module.exports = obj;