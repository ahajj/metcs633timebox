const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash');
const utils = require('../helpers/utils');

router.get('/', async function (req, res) {
  let parms = {};
  let dates = utils.getStartDate(req);
  let start = dates.start;
  let end = dates.end;

  //start and end date format 2020-01-31
  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API
  let apiUrl = '';
  if (req.query.userId) {
    if (req.query.calendarId) {
      //TODO check on this call.
      apiUrl = `/users/${req.query.userId}/calendar/${req.query.calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    }
    else {
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

      if (req.query.category && req.query.category.length > 0) {
        result.value = utils.filterToCategory(result, req.query.category)
      }
      console.log('/events', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      utils.handleError(err, res);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

module.exports = router;