var os = require('os')

var inet = os.networkInterfaces()

exports.ip = []
for( var i in inet ) {
  for( var j in inet[i]) {
    var addr = inet[i][j]
    if( addr.family === 'IPv4' && !addr.internal)
      exports.ip.push(addr.address)
  }
}

exports.hostname = os.hostname()
exports.pid = process.pid
