var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');

require('dotenv').config();

// var calendar = require('./routes/calendar');
// var events = require('./routes/events');
// var categories = require('./routes/categories');
// var users = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'i18n', 'i18n.properties')));
app.use(express.static(path.join(__dirname, 'public', 'bundle-helpers.js')));

// app.use('/events', events);
// app.use('/categories', categories);
// app.use('/calendars', calendar);
// app.use('/users', users);
module.exports = app;
