var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');

require('dotenv').config();

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'i18n', 'i18n.properties')));
app.use(express.static(path.join(__dirname)));
module.exports = app;
