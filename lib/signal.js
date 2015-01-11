var fn     = require('fn.js');
var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record;

var Packet = require('./packet');

var Signal = Record({
  signal: '',
  cid: null,
  uuid: null,
  timestamp: null,
  payload: null,
  source: null
});

Signal.prototype.causedBy = function(packet) {
  return this.merge({cid: packet.cid});
};

exports.new = function(blueprint) {
  return Signal(blueprint);
}

exports.make = fn.curry(function(source, name, payload) {
  var p = Packet.make(source, payload);
  return exports.new({signal: name}).merge(p)
});
