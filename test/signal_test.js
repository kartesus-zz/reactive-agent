var assert = require('chai').assert;

var Signal = require('../lib/signal');

suite('Signal.make');

var payload = { foo: 'bar' }
var subject = Signal.make('Something', payload);

test('is a curryied function', function() {
  var s1 = Signal.make('Something');
  var s2 = Signal.make('Something', null);
  var s3 = s1(payload);

  assert.isFunction(s1);
  assert.isObject(s2);
  assert.isObject(s3);
});

test('is a valid packet', function(){
  assert.include(subject._keys, 'cid');
  assert.include(subject._keys, 'uuid');
  assert.include(subject._keys, 'timestamp');
  assert.include(subject._keys, 'payload');
});

test('is immutable', function() {
  var change = function() { subject.signal = "foo"; };
  assert.throw(change, 'Cannot set on an immutable record.');
});
