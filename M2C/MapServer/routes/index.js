"use strict";
var express = require('express');
var router = express.Router();
var users = require('./users');
var gasData = require('../model/gasData');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!users.checkLogin(req)) {
        res.redirect('user');
        return;
    }
  res.render('index');
});

router.get('/map', function(req, res, next){
  res.render('map');
});

router.get('/node', function(req, res, next){
  res.render('node');
});

router.get('/manage', function(req, res, next){
    if (!users.checkLogin(req)) {
        res.redirect('user');
        return;
    }
  res.render('manage');
});

router.get('/factory', function(req, res, next){
    if (!users.checkLogin(req)) {
        res.redirect('user');
        return;
    }
    res.render('factory');
});

router.get('/usermanage', function(req, res, next){
    if (!users.checkLogin(req)) {
        res.redirect('user');
        return;
    }

    res.locals.userName = req.session["username"];
    res.render('users/user');
});

router.post('/usermanage', function(req, res){
    var userName = req.session["username"],
        oldPsw = req.body.originPsw,
        newPsw = req.body.newPsw;
    users.changePsw(userName, oldPsw, newPsw, function(result){
        res.send(result);
    });
});

router.post('/M2C', function(req, res){
    var data = JSON.parse(Object.keys(req.body)[0]);
    var gas = new gasData();
    var result = false;
    if (data.distance > 0){
        gas.addLeak(data.distance, data.time, data.name, function (err, result) {
            if (err){
                console.log("add leak data error: " + err.message);
                return;
            }
        });
        result = true;
    }
    res.send(JSON.stringify({result:result}));
});

function sendError(res, jsonResult, error){
    jsonResult.flag = false;
    jsonResult.msg = error;
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonResult);
}

router.get('/gasJson', function(req, res, next){
    var jsonResult = {flag: true, msg: "success",result:{}};
    var param = req.query;
    var gas = new gasData();
    switch (param.func){
        case "getNodeGas":
            gas.getNodeGas(param.id, function(result, gasList){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = gasList;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
        break;
        case "getLeakGas":
            gas.getLeakGas(param.id, function(result, list){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = list;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
        break;
    }
});

router.get('/addGas', function (req, res, next) {
   res.render('addGas');
});

router.post('/addGas', function (req, res) {
    var data = req.body.data;
    var gas = new gasData();
    gas.addGas(data.name, data.time, data.startPressure,
        data.startFlow, data.endPressure, data.endFlow,
        data.temperature, function (err, result) {
            if (err){
                res.send(JSON.stringify({result:false, err:err.message}));
                return;
            }
            res.send(JSON.stringify({result:true}));
        })
})

module.exports = router;
