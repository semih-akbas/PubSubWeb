var express     = require("express");
var path        = require("path");
var fs          = require("fs");
var moment      = require('moment');

var router = express.Router();
var socket = null;
var logPath = __dirname + "/../cpuTempLog.txt";

//BASE_URL/diagnostics
router.get('/', function(req, res) {   
    console.log("I am at air.js");
    res.render('layouts/air');
});

module.exports = function(io){
    var express = require("express");
    socket = io;
    return router;
}