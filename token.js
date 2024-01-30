require('dotenv').config({ path: 'C:/dev/calorie_tracker/calorie_tracker/backend/.env'});
const createConnection = require('./utils/sqlConnect')
const token = require('./consts');
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
let sql = require('./utils/sql')
var connectionBank = createConnection()
var sqlDAO = new sql(connectionBank)
var request = require("request");

var options = {
   method: 'POST',
   url: 'https://oauth.fatsecret.com/connect/token',
   method : 'POST',
   auth : {
      user : clientID,
      password : clientSecret
   },
   headers: { 'content-type': 'application/x-www-form-urlencoded'},
   form: {
      'grant_type': 'client_credentials',
      'scope' : 'premier'
   },
   json: true
};

    
request(options, async function (error, response, body) {
   if (error) throw new Error(error);


   if(response.statusCode == 200){
      token.setToken(body.access_token)
      console.log('Novo token\n'+token.token)
      try{
         await sqlDAO.updateWithResponse(`update ct_user set token = '${body.access_token}', last_upd = now() where rowid = 'i'`);
      } catch (e){
         throw new Error(e);
      } finally {
         process.exit();
      }
      
      

   }
});