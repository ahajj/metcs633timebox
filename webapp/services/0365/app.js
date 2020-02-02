var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

require('dotenv').config();

var calendar = require('./routes/calendar');
var users = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/', calendar);
app.use('/', users);

module.exports = app;
