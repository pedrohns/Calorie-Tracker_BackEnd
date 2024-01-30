const { v4 : uuidv4 } = require('uuid');
async function getRowid(){
    return uuidv4();
}

module.exports = getRowid;