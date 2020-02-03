const express = require('express');
const router = express.Router();
const helper = require('../helpers/auth');
const utils = require('../helpers/utils');
/* GET /calendar */
router.get('/', async function (req, res) {
  let parms = {};
  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API

  if (client) {
    try {
      const result = await client
        .api(`/users`)
        .get();
      parms.result = result;
      console.log('/users', parms.result);
      res.status(200).send(result);
    } catch (err) {
      utils.handleErrors(err, res);
    }
  } else {
    res.status(404).send('Grapgh client could not be established.');
  }
});
//TODO check
router.get('/:name', async function (req, res) {
  let parms = {};
  const client = await helper.getGraphClient() || null; //Get client to make calls to Graph API
  if (client) {
    try {
      const result = await client
        .api(`/users?$select=displayName,id&$filter=identities/any(c:c/issuerAssignedId eq '${req.params.name}'`)
        .get();
      parms.result = result;
      console.log(`/users?$select=displayName,id&$filter=identities/any(c:c/issuerAssignedId eq '${req.params.name}'`, parms.result);
      res.status(200).send(result);
    } catch (err) {
      utils.handleErrors(err, res);
    }
  } else {
    res.status(404).send('Grapgh client could not be established.');
  }
});

module.exports = router;