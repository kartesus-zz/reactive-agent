var fn     = require('fn.js');
var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record
var Map    = require('immutable').Map

var Packet = require('./packet');

var Demand = Record({
  cid: null,
  uuid: null,
  timestamp: null,
  payload: null,
  demand: '',
  reactions: Map()
});

Demand.prototype.react = function(title, summary) {
  return this.update('reactions', function(r) {
    return r.set(title, summary);
  });
}

exports.new = function(blueprint) {
  return new Demand(blueprint);
};

exports.make = fn.curry(function(name, payload, cid) {
  var packet = Packet.make(payload, cid);

  return new Demand({
    cid: packet.cid,
    uuid: packet.uuid,
    timestamp: packet.timestamp,
    payload: packet.payload,
    demand: name
  });
}, 2);
