var uuid   = require('uuid');
var moment = require('moment');

var Record = require('immutable').Record;

var Packet = Record({
  cid: '',
  uuid:'',
  timestamp:'',
  payload: {},
  source: ''
});

Packet.prototype.causedBy = function(packet) {
  return this.merge({cid: packet.cid});
};

exports.new  = function(blueprint) {
  return new Packet(blueprint);
};

exports.make = function(source, payload) {
  return exports.new({
    cid: uuid.v1(),
    uuid: uuid.v1(),
    timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    payload: payload,
    source: source
  });
};
