var fn     = require('fn.js');
var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record;
var Map    = require('immutable').Map;

var Signal = Record({
  signal: null,
  cid: null,
  uuid: null,
  timestamp: null,
  payload: new Map()
});

var make = fn.curry(function(name, payload, cid) {
  if(! cid ) cid = uuid.v1();
  return new Signal({
    signal: name,
    cid: cid,
    uuid: uuid.v1(),
    timestamp: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZZ"),
    payload: new Map(payload)
  } )
}, 2);

module.exports = make;
