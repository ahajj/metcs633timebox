const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash');
const utils = require('../helpers/utils');

//Get all categories for all events.
router.get('/', async function (req, res) {
  let parms = {};
  let start, end = new Date();

  //start and end date format 2020-01-31
  let dates = utils.getStartDate(req);
  start = dates.start;
  end = dates.end;

  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  let apiUrl = '';
  if (req.query.userId) {
    if (req.query.calendarId) {
      apiUrl = `/users/${req.query.userId}/calendars/${req.query.calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    } else {
      apiUrl = `/users/${req.query.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    }
  }

  if (client) {
    try {
      const result = await client
        .api(apiUrl)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;

      let retCategories = [];
      if (parms.result && parms.result.value) {
        parms.result.value.forEach(element => {
          retCategories = retCategories.concat(element.categories);
        });
      }
      parms.result = JSON.stringify([...new Set(retCategories)]);
      console.log('/categories result:', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
    utils.handleClientConnectionError('Graph client could not be established.', res);
  }
});


router.get('/time', async function (req, res) {
  //Get all events
  let parms = {};
  let start, end = new Date();

  //start and end date format 2020-01-31
  let dates = utils.getStartDate(req);
  start = dates.start;
  end = dates.end;

  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  let apiUrl = '';
  if (req.query.userId) {
    if (req.query.calendarId) {
      apiUrl = `/users/${req.query.userId}/calendars/${req.query.calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    } else {
      apiUrl = `/users/${req.query.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    }
  }
  if (client) {
    try {
      const result = await client
        .api(apiUrl)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;

      let catTimeTotals = {};
      if (parms.result && parms.result.value) {
        parms.result.value.forEach(element => {
          catTimeTotalsCats = element.categories;
          catTimeTotalsCats.forEach(cat => {
            if (catTimeTotals[cat]) {
              let milliSeconds = parseFloat(catTimeTotals[cat], 10);
              milliSeconds += utils.getTimeDifference(element.start.dateTime, element.end.dateTime);
              catTimeTotals[cat] = milliSeconds;
            } else {
              catTimeTotals[cat] = utils.getTimeDifference(element.start.dateTime, element.end.dateTime)
            }
          });

        });
      }
      parms.result = JSON.stringify(catTimeTotals);
      console.log('/time result:', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
    utils.handleClientConnectionError('Graph client could not be established.', res);
  }
});

module.exports = router;