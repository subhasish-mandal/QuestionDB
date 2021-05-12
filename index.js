var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 

app.use('/Images', express.static('Images'));

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});



var AuthController = require(__root + 'Controller/AuthController');
app.use('/api/auth', AuthController);

var UserController = require(__root + 'Controller/UserController');
app.use('/api/users', UserController);

var CategoryController = require(__root + 'Controller/CategoryController');
app.use('/api/category', CategoryController);

var QuestionController = require(__root + 'Controller/QuestionController');
app.use('/api/question', QuestionController);

module.exports = app;