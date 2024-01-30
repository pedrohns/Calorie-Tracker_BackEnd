function sql(connection){
    this._connection = connection
}

sql.prototype.select = function (query){
    return new Promise ((resolve, reject) => {
        this._connection.query(query, function(err, rows, fields){
            if (err) return reject(err)
            resolve(rows)
        })
    })
}

sql.prototype.updateWithResponse = function (query){
    return new Promise ((resolve, reject) => {
        this._connection.query(query, function(err, rows, fields){
            if (err) return reject(err)
            resolve(rows)
        })
    })
}

sql.prototype.update = function (query){
    this._connection.query(query)
}
sql.prototype.insert = function (query){
    this._connection.query(query)
}

sql.prototype.kill = function (){
    this._connection.end();
}

module.exports = sql;