var Signal = require('./signal');
var Demand = require('./demand');
var Log    = require('./log');

function Agent(){}

Agent.prototype.signal = Signal.make;
Agent.prototype.demand = Demand.make;
Agent.prototype.info   = Log.make('INFO');
Agent.prototype.warn   = Log.make('WARN');
Agent.prototype.error  = Log.make('ERROR');
Agent.prototype.fatal  = Log.make('FATAL');

module.exports = Agent;
