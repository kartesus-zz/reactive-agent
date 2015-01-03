var fn = require('fn.js');

var Record = require('immutable').Record;

var Packet = require('./packet');

var Log = Record({
  log: '',
  level: '',
  cid: null,
  uuid: null,
  timestamp: null,
  payload: null,
  source: null
});

exports.new = function(blueprint) {
  return new Log(blueprint);
};

exports.make = fn.curry(function(source, level, name, payload, cid) {
  var p = Packet.make(source, payload, cid);
  return new Log({
    log: name,
    level: level,
    cid: p.cid,
    uuid: p.uuid,
    timestamp: p.timestamp,
    payload: p.payload,
    source: p.source
  });
}, 4);
