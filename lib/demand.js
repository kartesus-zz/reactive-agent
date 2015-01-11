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
  solutions: Map()
});

Demand.prototype.resolve = function(title, summary) {
  return this.update('solutions', function(r) {
    return r.set(title, summary);
  });
};

Demand.prototype.causedBy = function(packet) {
  return this.merge({cid: packet.cid});
};

exports.new = function(blueprint) {
  blueprint.solutions = Map(blueprint.solutions);
  return Demand(blueprint);
};

exports.make = fn.curry(function(source, name, payload) {
  var p = Packet.make(source, payload);
  return exports.new({demand: name}).merge(p);
});
