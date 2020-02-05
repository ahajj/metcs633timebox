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

router.get('/me', async function (req, res) {
  const accessToken = await authHelper.getAccessTokenUserAccess(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    // Set start of the calendar view to today at midnight
    const start = new Date(new Date().setHours(0, 0, 0));
    // Set end of the calendar view to 7 days from start
    const end = new Date(new Date(start).setDate(start.getDate() + 7));

    try {
      // Get the first 10 events for the coming week
      const result = await client
        .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
        .top(10)
        .select('subject,start,end,attendees')
        .orderby('start/dateTime DESC')
        .get();

      parms.events = result.value;
      res.render('calendar', parms);
    } catch (err) {
      parms.message = 'Error retrieving events';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.render('error', parms);
    }

  } else {
    // Redirect to home
    res.redirect('/');
  }
});

module.exports = router;