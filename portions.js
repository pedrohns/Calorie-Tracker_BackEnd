// Importando os módulos necessários
const createConnection = require('./utils/sqlConnect')
let sql = require('./utils/sql')
var connectionBank = createConnection()
var portionDAO = new sql(connectionBank)
const fs = require('fs');
const csv = require('fast-csv');
require('dotenv').config();
const path = 'C:/Users/Pichau/Downloads/FoodData_Central_sr_legacy_food_csv_2018-04/FoodData_Central_sr_legacy_food_csv_2018-04/food_portion.csv';

async function generateRowid() {
  var rowid = require('./utils/getRowid')
  return rowid()

}

async function insertData(food_id, amount, modifier, gram_weight){
  modifier = modifier.replace(/'/g, '')
  portionId = await generateRowid();
  string = `rowid = '${portionId}',created_by = 'i',last_upd_by = 'i',created = now(),last_upd = now(), 
        food_id = '${food_id}', portion = ${amount}, deleted_by = '', legend = '${modifier}', sizePortion = '${gram_weight}'`;
    portionDAO.insert(`insert into ct_food_portion set ${string}`);

}

// Lendo o arquivo CSV
fs.createReadStream(path)
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    insertData(row.fdc_id, row.amount, row.modifier, row.gram_weight);
  })
  .on('end', rowCount => {
    console.log(`Processed ${rowCount} rows`);
    //connection.end(); // Fechando a conexão quando terminar
  });
