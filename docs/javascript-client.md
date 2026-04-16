---
title: JavaScript Client
description: symple-client API reference
---

# JavaScript Client

`symple-client` is the browser and Node.js client. 9KB minified, no media dependencies.

## Install

```bash
npm install symple-client
```

## Connect

```javascript
import SympleClient from 'symple-client'

const client = new SympleClient({
  url: 'ws://localhost:4500',
  token: 'optional-auth-token',
  peer: {
    user: 'alice',
    name: 'Alice',
    type: 'person'
  },
  reconnection: true,
  reconnectionDelay: 3000,
  reconnectionAttempts: 0  // 0 = unlimited
})

client.on('connect', () => console.log('online'))
client.connect()
```

## Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | `ws://localhost:4500` | Server WebSocket URL |
| `token` | string | undefined | Auth token |
| `peer` | object | `{}` | Peer identity (`user` required, `name` and `type` optional) |
| `reconnection` | boolean | true | Auto-reconnect on disconnect |
| `reconnectionDelay` | number | 3000 | Milliseconds between retries |
| `reconnectionAttempts` | number | 0 | Max retries (0 = unlimited) |

## Methods

### connect()

Open a WebSocket connection and authenticate.

### disconnect()

Close the connection gracefully. Stops reconnection.

### shutdown()

Close the connection and nullify the socket.

### send(message, to?)

Send any message. Sets `type: 'message'` if not specified. Generates an `id` if missing. Throws if offline.

```javascript
client.send({
  subtype: 'chat',
  data: { text: 'Hello' }
}, 'bob|session-id')
```

### sendMessage(message, to?)

Shorthand for `send()` with `type: 'message'`.

### respond(message)

Send a reply -- swaps `to` and `from` from the original message.

### sendPresence(p?)

Broadcast presence to all rooms. Merges peer data automatically.

### join(room)

Join a dynamic room (requires `dynamicRooms: true` on server).

### leave(room)

Leave a room.

### addCapability(name, value?)

Add a capability to the local peer. Value defaults to `true`.

### removeCapability(name)

Remove a capability and broadcast presence.

### hasCapability(peerId, name)

Check if a remote peer has a capability.

### getCapability(peerId, name)

Get the value of a remote peer's capability.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `online` | boolean | Connected and authenticated |
| `peer` | object | Local peer data (includes `id` after auth) |
| `roster` | Roster | Connected peers |
| `error` | string | Current error state |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | - | Authenticated successfully |
| `disconnect` | - | Connection closed |
| `reconnect_attempt` | number | Reconnection attempt number |
| `connect_error` | error | WebSocket error |
| `error` | error, message | Server error or fatal error |
| `message` | msg | Message received |
| `presence` | msg | Presence update |
| `command` | msg | Command received |
| `event` | msg | Event received |
| `addPeer` | peer | Peer came online (via roster) |
| `removePeer` | peer | Peer went offline (via roster) |
