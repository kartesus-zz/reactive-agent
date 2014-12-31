var fn     = require('fn.js');
var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record;
var Map    = require('immutable').Map;

var Packet = require('./packet');

var Signal = Record({
  signal: '',
  cid: null,
  uuid: null,
  timestamp: null,
  payload: null
});

exports.new = function(blueprint) {
  return new Signal(blueprint);
}

exports.make = fn.curry(function(name, payload, cid) {
  var p = Packet.make(payload, cid)
  return new Signal({
    signal: name,
    cid: p.cid,
    uuid: p.uuid,
    timestamp: p.timestamp,
    payload: p.payload
  } )
}, 2);
