/* file: userData.js
    功能：数据库相关操作
*/

"use strict";
var sqlite = require('sqlite3'),
    database,
    path = require('path');

function UserData(user){
    this.username = user.username;
    this.password = user.password;
    this.name = user.name;
    this.superUser = 0;
    database = new sqlite.Database(path.join(__dirname, '..', 'data', 'data.sqlite'));
}

UserData.prototype.register = function(callback){
    var sqlStr = "INSERT INTO 'user' VALUES ('"
                    + this.username + "', '"
                    + this.password + "', '"
                    + this.name + "', '"
                    + this.superUser + "')";
    database.run(sqlStr, function(err, result){
        callback(err, result);
    });
};

UserData.prototype.setAdmin = function(){
    var sqlStr = "UPDATE 'user' SET superUser = 1 WHERE username = '" 
                    + this.username + "'";
    database.run(sqlStr);
};

UserData.prototype.get = function(callback){
    var sqlStr = "SELECT * FROM 'user' WHERE username = '" 
                    + this.username + "'";
    database.all(sqlStr, function(err, rows){
        callback(err, rows);
    });
};

UserData.prototype.destroy = function(){
    if (database !== undefined){
        database.close();
        database = undefined;
    }
};

UserData.prototype.changePsw = function(newPsw, callback){
    var username = this.username;
    var search = "SELECT * FROM 'user' WHERE username = '" + username + "' AND " + "password = '" + this.password + "'";
    database.all(search, function(err, rows){
        var sqlStr = 'UPDATE "user" SET password = "' + newPsw + '" WHERE  username = "' + username + '"';
        if (rows.length == 1){
            database.run(sqlStr, callback("success"));
        }
        else{
            callback("failed");
        }
    });
}

module.exports = UserData;
