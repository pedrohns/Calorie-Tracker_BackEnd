const createConnection = require('./utils/sqlConnect')
let sql = require('./utils/sql')
var connectionBank = createConnection()
var sqlDAO = new sql(connectionBank)

const pathSearch = 'https://platform.fatsecret.com/rest/server.api?method=foods.search.v2&format=json&flag_default_serving=true';
const pathOneFood = 'https://platform.fatsecret.com/rest/server.api?method=food.get.v2&format=json';
const pathAutoComplete = 'https://platform.fatsecret.com/rest/server.api?method=foods.autocomplete.v2&format=json&max_results=2';

const obj = {
    token:'',
    path:pathSearch,
    pathFood:pathOneFood,
    pathAutoComplete: pathAutoComplete,
    setToken: function(bearer)  {
        this.token = bearer
    },
    // Fazendo como async
    getToken: async function() {
        var results = await sqlDAO.select(`select token from ct_user where rowid = 'i' and deleted_by = ''`)
        if(results.length > 0){
            return results[0];
        }
    }

    // Fazendo tratando a promise direto
    // getToken: function(callback) {
    //     sqlDAO.select(`select token from ct_user where rowid = 'i' and deleted_by = ''`)
    //         .then(results => {
    //             if (results.length > 0){
    //                 callback(null, results[0]);
    //             } else {
    //                 callback(null, null);
    //             }
    //         })
    //         .catch(error => {
    //             callback(error);
    //         });
    // }
}

module.exports = obj;