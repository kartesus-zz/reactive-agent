var where = require('lodash.where')

var Signal = require('./lib/signal')
var Demand = require('./lib/demand')
var Log    = require('./lib/log')

var Logger = require('./lib/logger');

var servicebus = require('servicebus')

var EventEmitter = require('events').EventEmitter

function Agent(name, config) {
  this.name = name
  this.bus  = servicebus.bus()

  this.signal = Signal.make(name)
  this.demand = Demand.make(name)

  this.info  = Log.make(this.name, 'INFO')
  this.warn  = Log.make(this.name, 'WARN')
  this.error = Log.make(this.name, 'ERROR')

  Agent.Logger = Agent.Logger || Logger;

  var o = this.output()
  o(this.info('Agent.Started', config))

  var agent = this
  process.on('SIGINT', function() { process.exit(0) })

  process.on('exit', function(code) {
    o(agent.error('Agent.Shutdown', {exitCode: code}))
  })

  process.on('uncaughtException', function(e) {
    o(agent.error('Agent.Died', { exception: e.constructor.name,
                                  message: e.message }))
    process.exit(1)
  })

}

Agent.prototype.output = function() {
  var send = this.bus.publish.bind(this.bus)
  var log  = Agent.Logger.log
  var agent = this.name;
  return function() {
    for(var i in arguments) {
      var obj = arguments[i].toJS()
      send(obj.demand || obj.signal || obj.log, obj)
      log(agent, obj)
    }
  }
}

Agent.prototype.input = function(spec) {
  var emitter = new EventEmitter()
  var log     = Agent.Logger.log;
  var agent   = this.name;
  this.bus.subscribe(spec.demand || spec.signal || spec.log, function(msg) {
    var match = where([msg], spec)
    if( match.length === 0 ) return

    var packet;
    if( msg.demand )      packet = Demand.new(msg)
    else if( msg.signal ) packet = Signal.new(msg)
    else if( msg.log )    packet = Log.new(msg)

    emitter.emit('data', packet)
    log(agent, packet)
  })

  return emitter;
}

module.exports = Agent;

