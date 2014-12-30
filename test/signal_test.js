var assert = require('chai').assert;

var Signal = require('../lib/signal');

suite('Signal');

var payload = { foo: 'bar' }
var subject = Signal('Something', payload);

test('is a curryied function', function() {
  var s1 = Signal('Something');
  var s2 = Signal('Something', null);
  var s3 = s1(payload);

  assert.isFunction(s1);
  assert.isObject(s2);
  assert.isObject(s3);
});

test('name is immutable', function() {
  var change = function() { subject.signal = "foo"; };
  assert.throw(change, 'Cannot set on an immutable record.');
});

test('set cid to valid uuid if none is passed', function() {
  var r = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  assert.match(subject.cid, r);
});

test('set cid when present', function() {
  var s = Signal('Something', null, 'somecid')
  assert.equal(s.cid, 'somecid');
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

test('payload is a map', function() {
  assert(subject.payload.constructor.isMap(subject.payload));
});

test('payload maps passed object', function() {
  assert.equal(subject.payload.get('foo'), payload.foo);
});
