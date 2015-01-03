var Agent = require('../index')

var a1 = new Agent('a1',{rabbitmq:'amqp://guest:guest@localhost:5672/hayek'})
var a2 = new Agent('a2',{rabbitmq:'amqp://guest:guest@localhost:5672/hayek'})

var s = a2.signal('sent', {some: 'data'})
var d = a2.demand('something', {more: 'data'})
var l = a2.info('event', {event: 'data'})

a1.input({signal: 'sent'}).on('data', function(packet){})
a1.input({demand: 'something'}).on('data', function(packet){})
a1.input({log: 'event'}).on('data', function(packet){})

setTimeout(function(){
  var send = a2.output()
  send(s)
  send(d)
  send(l)
}, 300)
