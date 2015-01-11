var assert = require('chai').assert;

var Signal = require('../lib/signal');

suite('Signal.make');

var payload = { foo: 'bar' }
var subject = Signal.make('Source', 'Signal', payload);

test('is a curryied function', function() {
  var s1 = Signal.make('Source', 'Signal');
  var s2 = s1(payload);

  assert.isFunction(s1);
  assert.isObject(s2);
});

test('is a valid packet', function(){
  assert.include(subject._keys, 'cid');
  assert.include(subject._keys, 'uuid');
  assert.include(subject._keys, 'timestamp');
  assert.include(subject._keys, 'payload');
});

test('is caused by other packets', function(){
  var s1 = Signal.make('Source', 'Signal', payload);
  var s2 = Signal.make('Source', 'Signal', payload);
  var s3 = s1.causedBy(s2);
  assert.equal(s3.uuid, s1.uuid);
  assert.equal(s3.cid, s2.cid);
});

test('is immutable', function() {
  var change = function() { subject.signal = "foo"; };
  assert.throw(change, 'Cannot set on an immutable record.');
});
