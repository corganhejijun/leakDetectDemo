"use strict";
var sqlite = require('sqlite3');
var database;
var path = require('path');

function getFactoryList(callback){
    var sqlStr = "SELECT * FROM 'factory'";
    database.all(sqlStr, function(err, rows){
        callback(err, rows);
    });
}

function getNodeTree(factory, nodes){
    var nodeNames = [];
    for (var i = 0; i < nodes.length; i++){
        var found = false;
        for (var j = 0; j < nodeNames.length; j++){
            if (nodeNames[j].id == nodes[i].factory){
                found = true;
                nodeNames[j].node.push({name: nodes[i].name, id: nodes[i].id});
                break;
            }
        }
        if (!found){
            for (var j = 0; j < factory.length; j++){
                if (factory[j].id == nodes[i].factory){
                    var f = {name: factory[j].name, id: factory[j].id, node:[{name: nodes[i].name, id: nodes[i].id}]};
                    nodeNames.push(f);
                    break;
                }
            }
        }
    }
    return nodeNames;
}

var Nodes = function(){
    database = new sqlite.Database(path.join(__dirname, '..', 'data', 'data.sqlite'));
};

Nodes.prototype.getFactory = function(callback){
    getFactoryList(function(err, rows){
        callback(err, rows);
    });
}

Nodes.prototype.saveNode = function (type, data, callback) {
    var sqlStr = "";
    if (type == 'save'){
        sqlStr = "UPDATE 'node' SET factory='" + data.factory 
                    + "', name='" + data.name + "', latitude='" + data.lat + "', longitude='" + data.long
                    + "' WHERE id='" + data.id + "'";
    } else if (type == 'delete'){
        sqlStr = "DELETE FROM 'node' WHERE id='" + data.id + "'";
    } else if (type == 'saveNew'){
        sqlStr = "INSERT INTO 'node' (factory, name, latitude, longitude) VALUES ('"
                    + data.factory + "','" + data.name + "','" + data.lat + "','" + data.long + "')";
    } else {
        callback("error");
    }
    database.run(sqlStr, function(err, result){
        callback(err);
    });
}

Nodes.prototype.saveFactory = function (type, data, callback) {
    var sqlStr = "";
    if (type == 'save'){
        sqlStr = "UPDATE 'factory' SET name='" + data.name 
                    + "', latitude='" + data.lat + "', longitude='" + data.long
                    + "' WHERE id='" + data.id + "'";
    } else if (type == 'delete'){
        sqlStr = "DELETE FROM 'factory' WHERE id='" + data.id + "'";
    } else if (type == 'saveNew'){
        sqlStr = "INSERT INTO 'factory' (name, latitude, longitude) VALUES ("
                    + data.name + "," + data.lat + "," + data.long + ")";
    } else {
        callback("error");
    }
    database.run(sqlStr, function(err, result){
        callback(err);
    });
}

Nodes.prototype.getNode = function(callback){
    getFactoryList(function(err, rows){
        if (err != null){
            callback(err.message, null);
            return;
        }
        var sqlStr = "SELECT * FROM 'node'";
        database.all(sqlStr, function(err2, rowsNode){
            if (err2 != null){
                callback(err.message, null);
                return;
            }
            callback(null, getNodeTree(rows, rowsNode));
        });
    });
}

Nodes.prototype.getNodeList = function(callback){
    var sqlStr = "SELECT * FROM 'node'";
    database.all(sqlStr, function(err, rows){
        if (err != null){
            callback(err.message, null);
            return;
        }
        callback(null, rows);
    });
}

Nodes.prototype.getEquip = function(node, callback){
    var sqlStr = "SELECT * FROM 'node' WHERE id=" + node;
    database.all(sqlStr, function(err, nodeRow){
        if (err != null){
            callback(err.message, null);
            return;
        }
        callback(null, nodeRow[0]);
    });
}

Nodes.prototype.getLeak = function(id, callback){
    var sqlStr = "SELECT * FROM 'leak' WHERE id=" + id;
    database.all(sqlStr, function(err, nodeRow){
        if (err != null){
            callback(err.message, null);
            return;
        }
        callback(null, nodeRow[0]);
    });
}

Nodes.prototype.queryLeak = function(callback){
    var sqlStr = "SELECT * FROM 'leak'";
    database.all(sqlStr, function(err, leakRow){
        if (err != null){
            callback(err.message, null);
            return;
        }
        callback(null, leakRow);
    });
}

Nodes.prototype.getPos = function(factory, node, leak, callback){
    if (factory == null){
        var sqlStr = "SELECT * FROM 'leak'";
        database.all(sqlStr, function (err, rows) {
           if (err != null) {
                callback(err.message, null);
           }
           for (var i = 0; i < rows.length; i++){
               if (leak == rows[i].node){
                   callback(null, [rows[i].latitude, rows[i].longitude]);
                   return;
               }
           }
        });
        return;
    }
    var sqlStr = "SELECT * FROM 'node'";
    database.all(sqlStr, function(err, rows){
        if (err != null){
            callback(err.message, null);
        }
        for (var i = 0; i < rows.length; i++){
            if (factory == rows[i].factory && node == rows[i].id){
                callback(null, [rows[i].latitude, rows[i].longitude]);
                return;
            }
        }
        callback('no this factory', null);
    });
}

module.exports = Nodes;