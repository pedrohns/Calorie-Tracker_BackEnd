var app = require('./custom-express')();
require('dotenv').config()
const PORT = process.env.PORT || 8080


app.listen(PORT, function(){
    console.log(`Servidor rodando na porta: ${PORT}`);
});