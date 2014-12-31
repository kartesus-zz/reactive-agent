var fn = require('fn.js');

var Record = require('immutable').Record;

var Packet = require('./packet');

var Log = Record({
  log: '',
  level: '',
  cid: null,
  uuid: null,
  timestamp: null,
  payload: null
});

exports.new = function(blueprint) {
  return new Log(blueprint);
};

exports.make = fn.curry(function(level, name, payload, cid) {
  var p = Packet.make(payload, cid);
  return new Log({
    log: name,
    level: level,
    cid: p.cid,
    uuid: p.uuid,
    timestamp: p.timestamp,
    payload: p.payload
  });
}, 3);
