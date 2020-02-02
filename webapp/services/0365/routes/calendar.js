const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const _ = require('lodash')
/* GET /calendar */
router.get('/events', async function (req, res) {
  // let parms = {};


  // const start = new Date(new Date().setHours(0, 0, 0));
  // const end = new Date(new Date(start).setDate(start.getDate() + 50));

  // console.log('start date:', start);
  // console.log('end date:', end);

  // const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  // if (client) {
  //   try {
  //     const result = await client
  //       .api(`/users/me/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
  //       //.top(10)
  //       .select('subject,start,end,attendees')
  //       .orderby('start/dateTime DESC')
  //       .get();
  //     parms.result = result;

  //     console.log('/events', parms.result);
  //     res.status(200).send(result);
  //   } catch (err) {
  //     parms.message = 'Error retrieving events';
  //     parms.error = { status: `${err.code}: ${err.message}` };
  //     parms.debug = JSON.stringify(err.body, null, 2);
  //     res.status(404).send({ parms });
  //   }
  // } else {
  //   res.status(404).send('Graph client could not be established.');
  // }
});

function getStartDate(req) {
  let start, end = new Date();
  if (req.query.startDate && req.query.endDate) {
    start = new Date(new Date(req.query.startDate).setHours(0, 0, 0));
    end = new Date(new Date(req.query.endDate).setHours(0, 0, 0));
  } else {
    end = new Date(new Date().setHours(0, 0, 0));
    start = new Date(new Date(2015, 3, 2).setHours(0, 0, 0));
  }
  return { start, end };
}

function handleError(err) {
  parms.message = 'Error retrieving events';
  parms.error = { status: `${err.code}: ${err.message}` };
  parms.debug = JSON.stringify(err.body, null, 2);
  res.status(404).send({ parms });
}

router.get('/calendars/:userId', async function (req, res) {
  let parms = {};

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.params.userId}/calendars`)
        .get();
      parms.result = result;

      console.log('/calendars/:userId', parms.result);
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

router.get('/calendar/:userId/:calendarId', async function (req, res) {
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
      handleError(err);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

router.get('/events/:userId', async function (req, res) {
  let parms = {};
  let dates = getStartDate(req);
  let start = dates.start;
  let end = dates.end;

  //start and end date format 2020-01-31
  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.params.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;

      console.log('/events/:userId', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      handleError(err);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

//Get all events for a particular category.
router.get('/events/:userId/:category', async function (req, res) {
  let parms = {};
  let start, end = new Date();

  //start and end date format 2020-01-31
  let dates = getStartDate(req);
  start = dates.start;
  end = dates.end;

  console.log('start date:', start);
  console.log('end date:', end);

  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users/${req.params.userId}/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
        .orderby('start/dateTime DESC')
        .get();
      parms.result = result;
      if (result && result.value && req.params.category) {
        let filtered = [];
        let i = 0;
        result.value.forEach(element => {
          if (element.categories.indexOf(req.params.category) > -1) {
            filtered.push(result.value[i]);
          }
          i++;
        });
        result.value = _.cloneDeep(filtered);
      }

      console.log('/events/:category result:', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      handleError(err);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

//Get all categories for all events.
router.get('/events/:userId/categories', async function (req, res) {
  console.log('/events/:userId/categories');
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

      console.log('/events/:calendarId/categories result:', parms.result);
      res.status(200).send(parms.result);
    } catch (err) {
      handleError(err);
    }
  } else {
    res.status(404).send('Graph client could not be established.');
  }
});

module.exports = router;