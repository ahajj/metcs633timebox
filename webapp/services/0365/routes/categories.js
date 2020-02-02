const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash');
const utils = require('../helpers/utils');

//Get all categories for all events.
router.get('/user/:userId/calendars/categories', async function (req, res) {
  let parms = {};
  let start, end = new Date();

  //start and end date format 2020-01-31
  let dates = getStartDate(req);
  start = dates.start;
  end = dates.end;

  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  let apiUrl = (req.query.calendarId !== null && req.query.calendarId.length > 0) ?
    `/users/${req.params.userId}/calendars/${req.query.calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}` :
    `/users/${req.params.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;

  if (client) {
    try {
      const result = await client
        .api(apiUrl)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;

      if (parms.result && parms.result.value) {
        let retCategories = [];
        parms.result.value.forEach(element => {
          retCategories = retCategories.concat(element.categories);
        });
      }
      parms.result = retCategories;
      console.log('/user/:userId/calendars/categories result:', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      handleError(err, res);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

module.exports = router;