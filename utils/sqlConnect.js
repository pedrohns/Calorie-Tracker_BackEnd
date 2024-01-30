var mysql = require('mysql2');
require('dotenv').config()
console.log(process.env.DB_HOST)

function createConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        insecureAuth: true
    });
};


module.exports = createConnection;