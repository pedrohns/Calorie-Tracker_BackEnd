const consts = require('../consts');
var bearer;


// teste usando o async, ou seja, recebendo um promise
// var oi = consts.getToken()
//     .then(
//         row => {
//             console.log(row.token)
//         }).catch(error => {
//             console.error(error)
//         })

// agora ja tratando a promise

consts.getToken((error, token) => {
    if (error) {
        console.error(error);
        return;
    }
    bearer = token;
});

module.exports = bearer;