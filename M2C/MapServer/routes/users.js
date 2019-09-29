"use strict";
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var UserData = require('../model/userData.js');

/* GET users listing. */
router.get('/', function(req, res) {
    if (req.cookies.isLogin){
        req.session.username = req.cookies.isLogin;
    }
    if (req.session.username){
        res.redirect('/');
        return;
    }
    res.render('users/login');
});

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/user');
});

router.get('/reg', function(req, res){
    res.render('users/reg');
});

function getMd5Psw(psw){
    var md5 = crypto.createHash('md5');
    return md5.update(psw).digest('hex');
}

router.post('/', function(req, res){
    var userName = req.body.txtUserName,
        userPwd = getMd5Psw(req.body.txtUserPwd),
        isRem = req.body.chbRem;

    var newUser = new UserData({
        username: userName,
        password: userPwd,
        name: ''});

    var error;

    newUser.get(function(err, rows){
        if (rows === null || rows.length == 0){
            error = '用户不存在';
        }
        else if (rows.length > 1){
            error = '用户重名';
        }
        else if (rows[0].password != userPwd){
            error = '密码错误';
        }
        if (error){
            res.locals.error = error;
            res.render('users/login');
            return;
        }
        if (isRem){
            res.cookie('isLogin', userName, {maxAge: 6000});
        }
        res.locals.username = userName;
        req.session.username = res.locals.username;
        res.redirect('/');
    });
});

router.post('/reg', function(req, res){
    var userName = req.body.txtUserName,
        name = req.body.txtName,
        userPwd = getMd5Psw(req.body.txtUserPwd);

    var newUser = new UserData({
        username: userName,
        password: userPwd,
        name: name,
    });

    newUser.get(function(err, rows){
        if (rows != null && rows.length > 0){
            res.locals.error = '用户名已存在';
            res.render('users/reg');
            return;
        }
        newUser.register(function(err, result){
            if (err){
                res.locals.error = err;
                res.render('users/reg');
            }
            else{
                res.redirect('/');
            }
            newUser.destroy();
            return;
        });
    });
});

router.checkLogin = function(req){
    return ("username" in req.session);
};

router.getName = function(username, callback){
    var user = new UserData({
        username: username,
        password: '',
        name: ''});
    user.get(function(err, rows){
        if (rows === null || rows.length != 1){
            callback('');
        }
        var name = rows[0].name;
        if (name.length == 0){
            name = username;
        }
        callback(name);
    });
};

router.changePsw = function(username, oldPsw, newPsw, callback){
    var user = new UserData({
        username: username,
        password: getMd5Psw(oldPsw)});
    user.changePsw(getMd5Psw(newPsw), function(result){
        callback(result);
    });
};

module.exports = router;
