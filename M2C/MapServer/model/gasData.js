"use strict";
var sqlite = require('sqlite3');
var path = require('path');
var database;
var nodeData;

var GasData = function(){
    database = new sqlite.Database(path.join(__dirname, '..', 'data', 'gasData.sqlite'));
    nodeData = new sqlite.Database(path.join(__dirname, '..', 'data', 'data.sqlite'));
};

GasData.prototype.addLeak = function(distance, time, name, callback) {
    var sqlStr = "UPDATE 'leak' SET leak='" + distance + "', time='" + time 
                + "' WHERE name='管道" + name.substring(3) + "'";
    nodeData.run(sqlStr, function (err, result) {
        callback(err, result);
    })
};

GasData.prototype.addGas = function (tableName, time, startPressure, startFlow, endPressure, endFlow, temperature, callback) {
    var sqlStr = "INSERT INTO '" + tableName + "'(number,time,startPressure,startFlow,endPressure,endFlow,temperature) VALUES(1,'"
                    + time + "'," + startPressure + ","
                    + startFlow + "," + endPressure + ","
                    + endFlow + "," + temperature + ")";
    database.run(sqlStr, function (err, result) {
        callback(err, result);
    })
}

GasData.prototype.getNodeGas = function (id, callback){
    var nodeSqlStr = "SELECT * FROM 'node' WHERE id=" + id;
    nodeData.all(nodeSqlStr, function (err1, rows){
        if (err1 != null){
            callback(err1, null);
            return;
        }
        if (rows.length == 0){
            callback("no result for id = " + id, null);
            return;
        }
        var sqlStr = "SELECT * FROM 'gas" + rows[0].name.substring(2) + "' ORDER BY id DESC LIMIT 200";
        database.all(sqlStr, function(err, rows){
            callback(err, rows);
        });
    });
}

GasData.prototype.getLeakGas = function(id, callback){
    var nodeSqlStr = "SELECT * FROM 'leak' WHERE node=" + id;
    nodeData.all(nodeSqlStr, function(err, rows){
        callback(err, rows[0]);
    });
}

module.exports = GasData;