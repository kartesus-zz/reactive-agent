var where = require('lodash.where')

var Signal = require('./lib/signal')
var Demand = require('./lib/demand')
var Log    = require('./lib/log')

var Logger = require('./lib/logger');

var amqp = require('amqp')

var EventEmitter = require('events').EventEmitter

function Agent(name, config) {
  this.name = name;

  this.signal = Signal.make(name)
  this.demand = Demand.make(name)

  this.info  = Log.make(this.name, 'INFO')
  this.warn  = Log.make(this.name, 'WARN')
  this.error = Log.make(this.name, 'ERROR')

  Agent.Logger = Agent.Logger || Logger;

  var
      eventEmitter = new EventEmitter(),
      agent = this;

    console.log('Agent');

  var connection = amqp.createConnection(config.rabbitmq, {})
      .on('error', function(error) {
          console.log(error);
      })
      .on('ready', function() {

      connection.queue((config.rabbitmq.queue || 'agent-queue'), function(queue) {

          try{

              console.log('queue');

              queue.bind('#');

              Agent.prototype.output = function() {
                  var send = connection.publish;
                  var log  = Agent.Logger.log
                  var agent = this.name;

                  return function() {
                      for(var i in arguments) {
                          var obj = arguments[i].toJS()
                          send(
                              (obj.demand || obj.signal || obj.log),
                              obj
                          );
                          log(agent, obj)
                      }
                  }
              };

              Agent.prototype.input = function(spec) {
                  var emitter = new EventEmitter();
                  var log     = Agent.Logger.log;
                  var agent   = this.name;

                  queue.subscribe(spec.demand || spec.signal || spec.log, function(msg) {
                      var match = where([msg], spec);
                      if (match.length === 0) {
                          return;
                      }

                      var packet;
                      if ( msg.demand )      packet = Demand.new(msg)
                      else if ( msg.signal ) packet = Signal.new(msg)
                      else if ( msg.log )    packet = Log.new(msg)

                      emitter.emit('data', packet)
                      log(agent, packet)
                  });

                  return emitter;
              };

              var o = agent.output()

              o(agent.info('Agent.Started', config))
              process.on('SIGINT', function() { process.exit(0) })

              process.on('exit', function(code) {
                  o(agent.error('Agent.Shutdown', {exitCode: code}))
              })

              process.on('uncaughtException', function(e) {
                  o(agent.error('Agent.Died', { exception: e.constructor.name,
                      message: e.message }))
                  process.exit(1)
              });

              console.log('emit ready');

              eventEmitter.emit('ready', agent);

          }
          catch (e) {
              console.log(e);
          }
      });
  });

  return eventEmitter;
};
module.exports = Agent;

