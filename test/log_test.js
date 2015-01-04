var assert = require('chai').assert;

var Log = require('../lib/log');

suite('Log');

var payload = { some: 'data' };
var subject = Log.make('Source','INFO', 'Something', payload);

test('is a valid packet', function(){
  assert.include(subject._keys, 'cid');
  assert.include(subject._keys, 'uuid');
  assert.include(subject._keys, 'timestamp');
  assert.include(subject._keys, 'payload');
});

test('is a curryied function', function() {
  var s1 = Log.make('Source','INFO');
  var s2 = Log.make('Source','INFO','Something', null);
  var s3 = s1('Something',payload);

  assert.isFunction(s1);
  assert.isObject(s2);
  assert.isObject(s3);
});
