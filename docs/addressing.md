---
title: Addressing
description: Peer addressing, rooms, and message routing
---

# Addressing

Every symple peer has an address in the format `user|session-id`. The `user` field comes from the auth message. The `session-id` is assigned by the server on connection.

## Address format

```
alice|k7f9x2m4abc
  ^       ^
  user    session id (server-assigned)
```

Parse and build addresses with the `Symple` utility:

```javascript
import Symple from 'symple-client/src/symple.js'

Symple.parseAddress('alice|k7f9x2m4abc')
// { user: 'alice', id: 'k7f9x2m4abc' }

Symple.buildAddress({ user: 'alice', id: 'k7f9x2m4abc' })
// 'alice|k7f9x2m4abc'
```

## Routing modes

The `to` field on a message determines how it's routed:

### No `to` field -- broadcast

```javascript
client.send({ type: 'message', data: { text: 'Hello everyone' } })
```

The server broadcasts to all peers in the sender's rooms, excluding the sender.

### String `to` -- direct or room

```javascript
// Direct to a specific peer (full address)
client.send({ type: 'message', data: { text: 'Hi Alice' } }, 'alice|k7f9x2m4abc')

// Broadcast to user's room (user only, no pipe)
client.send({ type: 'message', data: { text: 'Hi' } }, 'alice')
```

With a full `user|id` address, the message goes to that specific session. The server checks that sender and recipient share at least one room. Messages to peers without a shared room are silently dropped.

With just a `user` string (no pipe), the server broadcasts to the room named after that user.

### Array `to` -- multicast

```javascript
client.send({
  type: 'message',
  to: ['team-a', 'team-b'],
  data: { text: 'Cross-team announcement' }
})
```

Broadcasts to each named room, excluding the sender.

## Permission boundary

Peers must share at least one room to exchange direct messages. This is the only permission mechanism in symple. There is no global message bus.

Blocked messages are silently dropped. The sender receives no error.
