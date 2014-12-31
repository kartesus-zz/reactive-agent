var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record;
var Map    = require('immutable').Map;

var Packet = Record({cid: '', uuid:'', timestamp:'', payload: Map()});

exports.new  = function(blueprint) {
  return new Packet(blueprint);
};

exports.make = function(payload, cid) {
  return new Packet({
    cid: cid || uuid.v1(),
    uuid: uuid.v1(),
    timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    payload: Map(payload)
  });
};
