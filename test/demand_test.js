var assert = require('chai').assert;

var Demand  = require('../lib/demand');
var Map     = require('immutable').Map

suite('Demand.make');

var payload = { foo: 'bar' };
var subject = Demand.make('Source','Demand', payload);

test('is a curryied funciton', function() {
  var d1 = Demand.make('Source','Demand');
  var d2 = Demand.make('Source', 'Demand', null);
  var d3 = d1(payload);

  assert.isFunction(d1);
  assert.isObject(d2);
  assert.isObject(d3);
});

test('is a valid packet', function(){
  assert.include(subject._keys, 'cid');
  assert.include(subject._keys, 'uuid');
  assert.include(subject._keys, 'timestamp');
  assert.include(subject._keys, 'payload');
});

test('is immutable', function() {
  var change = function() { subject.demand = 'something'; };
  assert.throw(change, 'Cannot set on an immutable record.');
});

test('can record solutions',  function() {
  var summary = { some: 'data' };
  var resolved = subject.resolve('title', summary);

  assert.equal(subject.solutions.size, 0);
  assert.equal(resolved.solutions.size, 1);
  assert.deepEqual(resolved.solutions.get('title'), { some: 'data'});
});

suite('Demand.new');

test('solutions are maps', function() {
  var d = Demand.new({solutions: {foo: 'bar'}});
  assert(Map({foo: 'bar'}).equals(d.solutions));
});
