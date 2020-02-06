const _ = require('lodash');

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

function getTimeDifference(start, end) {
  return (Date.parse(end) - Date.parse(start));
}
function handleClientConnectionError(message, res) {
  res.status(404).send(message);
}
function handleError(err, res) {
  let parms = {};
  parms.message = 'Error retrieving events';
  parms.error = { status: `${err.code}: ${err.message}` };
  parms.debug = JSON.stringify(err.body, null, 2);
  res.status(404).send({ parms });
}


function filterToCategory(result, category) {
  if (result && result.value && category) {
    let filtered = [];
    let i = 0;
    result.value.forEach(element => {
      if (element.categories.indexOf(category) > -1) {
        filtered.push(element);
      }
      i++;
    });
    return _.cloneDeep(filtered);
  }
}


var O365Utils = window.O365Utils || {}
O365Utils.getStartDate = getStartDate;
O365Utils.handleError = handleError;
O365Utils.filterToCategory = filterToCategory;
O365Utils.getTimeDifference = getTimeDifference;
O365Utils.handleClientConnectionError = handleClientConnectionError;
window.O365Utils = O365Utils;

exports.getStartDate = getStartDate;
exports.handleError = handleError;
exports.filterToCategory = filterToCategory;
exports.getTimeDifference = getTimeDifference;
exports.handleClientConnectionError = handleClientConnectionError;