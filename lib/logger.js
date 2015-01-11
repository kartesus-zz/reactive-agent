function formatLogPayload(payload) {
  return Object.keys(payload)
               .map(function(k) { return k + '="' + format(payload[k]) + '"' })
               .join(' ')
}

function format(value) {
  var inspect = require('util').inspect
  if( value.constructor.name === 'String' ) return value
  if( value.constructor.name === 'Number' ) return value
  return inspect(value)
}

exports.log = function(agent, packet) {
  console.log('%s %s agent="%s" source="%s" cid="%s" %s',
    packet.timestamp,
    packet.log || packet.demand || packet.signal,
    agent,
    packet.source,
    packet.cid,
    formatLogPayload(packet.payload))
}
