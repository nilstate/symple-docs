---
title: Server
description: Running and configuring the symple server
---

# Server

The symple server is a Node.js WebSocket server built on the `ws` library. It handles authentication, room management, message routing, and optional Redis pub/sub for scaling.

## Quick start

```javascript
const Symple = require('symple-server')

const server = new Symple({
  port: 4500,
  authentication: false,
  dynamicRooms: true
})

server.init()
```

`Symple` is the default export. Call `init()` to start the HTTP and WebSocket servers, and connect to Redis if configured.

Or use the built-in entry point:

```bash
cd symple-server
npm start
```

This reads configuration from environment variables via `config.js`.

## Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 4500 | Listen port (`PORT` env var overrides) |
| `authentication` | boolean | false | Require token auth via Redis |
| `dynamicRooms` | boolean | true | Allow runtime join/leave |
| `sessionTTL` | number | -1 | Session timeout in minutes (-1 = no expiry) |
| `redis` | string | undefined | Redis connection URL |
| `ssl.enabled` | boolean | false | Enable HTTPS/WSS |
| `ssl.key` | string | - | SSL key file path |
| `ssl.cert` | string | - | SSL cert file path |

## Auth hook

Override `server.authenticate` for custom credential validation:

```javascript
server.authenticate = async (peer, auth) => {
  const user = await db.users.findByToken(auth.token)
  if (!user) return { allowed: false }
  return { allowed: true, rooms: user.teams }
}
```

See [Authentication](authentication) for details.

## Post-auth hook

```javascript
server.onAuthorize = (ws, peer) => {
  console.log('authorized:', peer.user, peer.id)
}
```

## Room management

Every peer auto-joins a room named after their `user` field. Additional rooms come from:

1. Auth hook return value
2. Redis session data
3. Auth message `rooms` field (only when `authentication: false`)
4. Dynamic join/leave (only when `dynamicRooms: true`)

## Message routing

The server routes based on the `to` field. It enforces the `from` field on all outbound messages -- clients cannot spoof their sender address. See [Addressing](addressing).

## Auth timeout

Connections that don't send an auth message within 10 seconds are closed with status 408.

## Shutdown

```javascript
server.shutdown()
```

Broadcasts a shutdown event, closes all connections, and cleans up Redis subscriptions.
