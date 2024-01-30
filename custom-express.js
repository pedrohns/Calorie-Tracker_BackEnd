var express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
var consign = require('consign');

module.exports = function() {
    var app = express();
    app.use(cors({
        origin: "*",
        credentials : true
    }));
    //app.use(express.static('./react'));
    app.use(bodyParser.json());
    app.use(express.urlencoded({extended:true}));
    consign()
        .include('./routes')
    //     .include('./modules')
        .into(app)
    return app;
};