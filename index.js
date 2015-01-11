var where = require('lodash.where')

var Signal = require('./lib/signal')
var Demand = require('./lib/demand')
var Log    = require('./lib/log')

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

Agent.prototype.log = function(packet, inwards) {
  var colors = require('colors/safe')
  var c = colors.cyan
  if( packet.level === 'ERROR') c = colors.red
  if( packet.level === 'WARN') c = colors.yellow
  console.log("\n%s " + c("[%s %s %s]") + "\ncid=\"%s\"\n%s",
    packet.timestamp,
    this.name,
    inwards ? '<-' : '->',
    packet.log || packet.demand || packet.signal,
    packet.cid,
    formatLogPayload(packet.payload))
}

Agent.prototype.output = function() {
  var send = this.bus.publish.bind(this.bus)
  var log  = this.log.bind(this)
  return function(packet) {
    var obj = packet.toJS()
    send(obj.demand || obj.signal || obj.log, obj)
    log(packet)
  }
}

Agent.prototype.input = function(spec) {
  var emitter = new EventEmitter()
  var log     = this.log.bind(this)
  this.bus.subscribe(spec.demand || spec.signal || spec.log, function(msg) {
    var match = where([msg], spec)
    if( match.length === 0 ) return

    var packet;
    if( msg.demand )      packet = Demand.new(msg)
    else if( msg.signal ) packet = Signal.new(msg)
    else if( msg.log )    packet = Log.new(msg)

    emitter.emit('data', packet)
    log(packet, true)
  })

  return emitter;
}

module.exports = Agent;

function formatLogPayload(payload) {
  return Object.keys(payload)
               .map(function(k) { return k + '="' + format(payload[k]) + '"' })
               .join('\n')
}

function format(value) {
  var inspect = require('util').inspect
  if( value.constructor.name === 'String' ) return value
  if( value.constructor.name === 'Number' ) return value
  return inspect(value)
}
