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
  source: null,
  demand: '',
  reactions: Map()
});

Demand.prototype.react = function(title, summary) {
  return this.update('reactions', function(r) {
    return r.set(title, summary);
  });
}

exports.new = function(blueprint) {
  return Demand(blueprint);
};

exports.make = fn.curry(function(source, name, payload, cid) {
  var p = Packet.make(source, payload, cid);
  return exports.new({demand: name}).merge(p);
}, 3);
