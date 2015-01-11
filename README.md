Agents observe the network and execute business logic based on observed **signals** and **demands**.

To create an agent just initialise it with a name and an URL pointing
to the RabbitMQ broker.

```javascript
var Agent = require('reactive-agent');
var agent = new Agent('Users', { rabbitmq: 'amqp://guest:guest@localhost:5672/topic' });
```

## Signals

Are sent after business logic is executed to inform interested
agents that they should synchronise with the current state.

```javascript
var send = agent.output();
var Created = agent.signal('UserCreated');
send(Created({name: 'Alex Gravem'}));
```

Over the wire, the signal sent would look something like this:

```javascript
{ signal: 'UserCreated',
cid: 'e3066cd0-93aa-11e4-ba68-2fac4b47aefc',
uuid: 'e3066cd1-93aa-11e4-ba68-2fac4b47aefc',
timestamp: '2015-01-04T01:44:49.054+0000',
payload: { name: 'Alex Gravem' },
source: 'Users' }
```

Where **cid** stands for *correlation id* and is used to track the
reactions to the signal from other agents and **source** is the name
of the agent which created the signal.

## Demands

Are used to ask for *help* to other agents in order to complete a job.
Lets say an agent needs a list of all users beginning with the
letter A.

```javascript
var send = agent.output();
var UsersList = agent.demand('UsersList');
send(UserList({startsWith: 'A'}));
```

Over the wire it would look like this:

```javascript
{ cid: '8e324810-93ae-11e4-ba68-2fac4b47aefc',
uuid: '8e324811-93ae-11e4-ba68-2fac4b47aefc',
timestamp: '2015-01-04T02:11:04.721+0100',
payload: { startsWith: 'A' },
source: 'UserAPI',
demand: 'UsersList',
solutions: {} }
```

The difference to signals is that demands have a map of solutions
different agents proposed to fulfil the demand.

# Reacting to signals

When writing agents it's common to update the persisted state based
on events from other agents. Say you're writing a `UserSearch` agent
and you need to update the search index every time a user is created.

```javascript
var send = agent.output();
agent.input({signal: 'UserCreated'}).on('data', function(signal) {
  SearchIndex.update(signal.payload);
});
```

# Processing Demands

At some point an agent will need to make something useful with
it's data. That's done by processing demands from other agents.

For the `UserSearch` from the last example that might be to return
a list of users.

```javascript
var send = agent.output();
agent.input({demand: 'UsersList'}).on('data', function(demand) {
  if( demand.solutions.get('List') ) return;

  var list = SearchIndex.list();
  var resolved = demand.resolve('List', list);
  send(resolved);
});
```

Notice that the agent didn't reply to the source.
Instead it just enriched the demand and put it back into the network.

That's a very important concept of demand processing. It ensures the
decoupling between the agent which created the demand and the agent
which resolved it. Even more important, it enables agents to
collaborate without orchestration.

In this contrived example, `UserSearch` doesn't care for applying
filters like `startsWith`. So to resolve that kind of demand we're
gonna create a `UserSearchByName` agent.

```javascript
var send = agent.output()
agent.input({demand: 'UsersList'}).on('data', function(demand) {
  var filter = demand.payload.startsWith;
  if( !filter ) return;

  var all = demand.solutions.get('List')
  if( !all ) return;

  var list = all.filter(function(user) {
    return user.name.indexOf(filter) !== -1;
  });

  var resolved = demand.resolve('ByName', list);
  send(resolved);
});
```

When `UsersList` is created, it will be sent at the same time to both
`UserSearch` and `UserSearchByName`. Since the `ByName` solution
depends on `All`, there is nothing `UserSearchByName` can do and the
demand will be ignored.

But because `UserSearch` returns the enriched demand to the network,
`UserSearchByName` can then *catch* it and perform it's job.

An optimised version of `UserSearchByName` could cache previous `All`
solutions and return a filtered list based on that cache if performance
is more important than accuracy.

Also notice that because an agent may receive the same packet more
then once, it should have guards in place to prevent resource wasting
and data corruption.

The agent which created the demand have the option of wait for a
`ByName` solution or try to do something with full list.

```javascript
var send = agent.output();
var UsersStartingWithA = agent.demand('UsersList', {startsWith: 'A'});
send(UsersStartingWithA);

(function(demand){
  var solutions = demand.solutions;
  var proposals = agent.input({demand:'UsersList', cid: demand.cid});

  var timeout = setTimeout(function() {
    proposals.removeAllListeners();
    console.log("Could not filter, here's all users", solutions.get('List'));
  }, 200);

  proposals.on('data', function(demand) {
    solutions = solutions.merge(demand.solutions);
    if( !solutions.get('ByName') ) return;
    clearTimeout(timeout);
    proposals.removeAllListeners();
    console.log("Your list", solutions.get('ByName'));
  });
})(UsersStartingWithA);
```
After sending a demand, the agent creates an input handler to
observe solutions to that demand. The agent will wait 200ms for it's
preferred solution (`ByName`), otherwise it will use `All`.

If `UserSearchByName` is able to generate a solution before the
deadline ends, the timeout is cleared and all further solutions
will be ignored.
