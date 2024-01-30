const fs = require('fs');

// Função para ler o arquivo .json e retornar o conteúdo como objeto JavaScript
function readJsonFile(filePath) {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Erro ao ler o arquivo:', error);
    return null;
  }
}

 function  extractValues(data)  {
    // 204 Fat
    // 205 Carbs
    // 208 Energy
    // 203 Protein
    const extractedData = data.map(item => ({
        fdcId: item.fdcId,
        description: item.description,
        protein: item.foodNutrients.find(nutrient => nutrient.number === 203)?.amount || 0,
        totalLipid: item.foodNutrients.find(nutrient => nutrient.number === "204")?.amount || 0,
        carbohydrate: item.foodNutrients.find(nutrient => nutrient.number === "205")?.amount || 0,
        energy: item.foodNutrients.find(nutrient => nutrient.number === "208")?.amount || 0
    }))
    return extractedData;
}

// Caminho para o arquivo .json (substitua 'caminho/para/arquivo.json' pelo caminho correto)
const filePath = 'C:/Users/Pichau/Downloads/FoodData_Central_foundation_food_json_2023-04-20/foundationDownload.json';

// Chamada da função para ler o arquivo .json
function init(){
    const jsonData = readJsonFile(filePath);
    var values = extractValues(jsonData);
    return values;
}

module.exports = init;


// Saída dos dados lidos
//console.log(jsonData);