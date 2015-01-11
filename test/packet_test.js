var assert = require('chai').assert
var Packet = require('../lib/packet');

suite('Packet');

var payload = {foo: 'bar'};
var subject = Packet.make('Source',payload);

test('creates cid', function() {
  var r = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  assert.match(subject.cid, r);
});

test('caused by other packet', function() {
  var s1 = Packet.make('Source', payload)
  var s2 = Packet.make('Source', payload)
  var s3 = s1.causedBy(s2);
  assert.equal(s3.uuid, s1.uuid);
  assert.equal(s3.cid, s2.cid);
});

test('cid is immutable', function() {
  var change = function() { subject.cid = "foo" }
  assert.throw(change, 'Cannot set on an immutable record.');
});

test('uuid is valid', function() {
  var r = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  assert.match(subject.uuid, r);
});

test('uuid is immutable', function() {
  var change = function() { subject.uuid = "foo" }
  assert.throw(change, 'Cannot set on an immutable record.');
});

test('timestamp is immutable', function() {
  var change = function() { subject.timestamp = "foo" }
  assert.throw(change, 'Cannot set on an immutable record.');
});

test('timestamp is valid iso-8601', function() {
  var r = /\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}\+\d{4}/;
  assert.match(subject.timestamp, r);
});
