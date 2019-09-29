var express = require('express');
var router = express.Router();

var Nodes = require('../model/equipNode.js');

function sendError(res, jsonResult, error){
    jsonResult.flag = false;
    jsonResult.msg = error;
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonResult);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var jsonResult = {flag: true, msg: "success",result:{}};
    var param = req.query;
    var nodes = new Nodes();
    switch (param.func){
        case "queryNode":
            nodes.getNode(function(result, nodeTree){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = nodeTree;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "getPosition":
            nodes.getPos(param.f, param.id, param.l, function(result, pos){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = pos;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "getEquip":
            nodes.getEquip(param.id, function(result, equip){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = equip;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "getLeak":
            nodes.getLeak(param.id, function(result, leak){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = leak;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "getNodeList":
            nodes.getNodeList(function(result, nodeList){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = nodeList;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "getFactoryConfig":
            nodes.getFactory(function(result, rows){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = rows;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "queryLeak":
            nodes.queryLeak(function(result, leakList){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                jsonResult.result = leakList;
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "saveNode":
            nodes.saveNode(param.type, param.data, function(result){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        case "saveFactory":
            nodes.saveFactory(param.type, param.data, function(result){
                if (result != null){
                    sendError(res, jsonResult, result);
                    return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(jsonResult);
            });
            break;
        default:
            jsonResult.flag = false;
            jsonResult.msg = "error";
            res.setHeader('Content-Type', 'application/json');
            res.send(jsonResult);
    }
});

module.exports = router;
