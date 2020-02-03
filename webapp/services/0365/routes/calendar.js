const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash');
const utils = require('../helpers/utils');

//Get all calendars by a user ID
router.get('/', async function (req, res) {
  let parms = {};

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.query.userId}/calendars`)
        .get();
      parms.result = result;

      console.log('/', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
     utils.handleClientConnectionError('Graph client could not be established.', res);
  }
});

//Get a specific calendar by ID
router.get('/:calendarId', async function (req, res) {
  let parms = {};

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.query.userId}/calendars/${req.params.calendarId}`)
        .get();
      parms.result = result;

      console.log('/:calendarId', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
     utils.handleClientConnectionError('Graph client could not be established.', res);
  }
});

module.exports = router;