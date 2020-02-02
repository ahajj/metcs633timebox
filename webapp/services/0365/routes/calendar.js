const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash');
const utils = require('../helpers/utils');

//Get all calendars by a user ID
router.get('/user/:userId/calendars', async function (req, res) {
  let parms = {};

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.params.userId}/calendars`)
        .get();
      parms.result = result;

      console.log('/user/:userId/calendars', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      parms.message = 'Error retrieving events';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.status(404).send({ parms });
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

//Get a specific calendar by ID
router.get('/user/:userId/calendars/:calendarId', async function (req, res) {
  let parms = {};

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.params.userId}/calendars/${req.params.calendarId}`)
        .get();
      parms.result = result;

      console.log('/calendar/:userId/:calendarId', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

router.get('/user/:userId/calendars/:calendarId/events', async function (req, res) {
  console.log('DIG POOP', req.query.calendarId);
  let parms = {};
  let dates = utils.getStartDate(req);
  let start = dates.start;
  let end = dates.end;

  //start and end date format 2020-01-31
  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API
  const apiUrl = (req.params.calendarId && req.params.calendarId <= 0) ?
    `/users/${req.params.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}` :
    //TODO check
    `/users/${req.params.userId}/calendar/${req.params.calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;

  if (client) {
    try {
      const result = await client
        .api(apiUrl)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;

      if (req.query.category && req.query.category.length > 0) {
        result.value = utils.filterToCategory(result, req.query.category)
      }
      console.log('/user/:userId/calendars/:calendarId/events', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

module.exports = router;