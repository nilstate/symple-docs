---
title: Protocol
description: Symple v4 wire protocol specification
---

# Symple Protocol v4

Real-time messaging and presence over WebSocket.

## Transport

- **WebSocket** (RFC 6455) over TCP
- **TLS** recommended for production (`wss://`)
- **Keepalive**: native WebSocket ping/pong frames (no application-level heartbeat)
- **Encoding**: all messages are UTF-8 JSON text frames
- No binary payloads

## Connection lifecycle

```
Client                              Server
  |                                    |
  |--- WebSocket connect ------------->|
  |                                    |
  |--- {"type":"auth", ...} --------->|  Client sends auth
  |                                    |  Server validates credentials
  |<-- {"type":"welcome", ...} -------|  Success: peer assigned, rooms joined
  |  or                                |
  |<-- {"type":"error", ...} ---------|  Failure: connection closed
  |                                    |
  |<-- presence broadcasts ----------->|  Peer online/offline notifications
  |<-- messages ---------------------->|  Routed messages between peers
  |                                    |
  |--- {"type":"close"} ------------->|  Graceful disconnect
  |--- WebSocket close --------------->|
```

## Message format

Every message is a JSON object with a `type` field:

```json
{
  "type": "string",
  ...
}
```

## Message types

### auth (client → server)

First message after WebSocket connect. Server closes the connection if not received within 10 seconds.

```json
{
  "type": "auth",
  "user": "alice",
  "name": "Alice",
  "token": "optional-auth-token",
  "rooms": ["team-a", "design"],
  "data": {}
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"auth"` |
| `user` | yes | User identifier (used for addressing and room membership) |
| `name` | no | Display name (defaults to `user`) |
| `token` | no | Auth token (required if server has `authentication` enabled) |
| `rooms` | no | Rooms to auto-join (also set from Redis session or auth hook) |
| `data` | no | Arbitrary peer data (capabilities, status, etc.) |

### welcome (server → client)

Sent after successful authentication.

```json
{
  "type": "welcome",
  "protocol": "symple/4",
  "peer": {
    "id": "a1b2c3d4",
    "user": "alice",
    "name": "Alice",
    "online": true,
    "host": "192.168.1.100"
  },
  "status": 200,
  "rooms": ["alice", "team-a", "design"]
}
```

| Field | Description |
|-------|-------------|
| `protocol` | Protocol version (`"symple/4"`) |
| `peer` | Authenticated peer object |
| `peer.id` | Server-assigned session ID (unique per connection) |
| `status` | HTTP-style status code (200 = success) |
| `rooms` | Rooms the peer was auto-joined to |

### error (server → client)

Sent on auth failure or protocol error. Server closes the connection after sending.

```json
{
  "type": "error",
  "status": 401,
  "message": "Authentication failed: invalid token"
}
```

### message (bidirectional, routed)

The core message type. Server routes based on the `to` field.

```json
{
  "type": "message",
  "id": "msg_abc123",
  "from": "alice|a1b2c3d4",
  "to": "bob|x9y8z7w6",
  "subtype": "call:offer",
  "data": {
    "sdp": "v=0\r\n..."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"message"` |
| `id` | yes | Unique message ID (client-generated) |
| `from` | yes | Sender address (`user|id` format) |
| `to` | no | Recipient. See routing rules below. |
| `subtype` | no | Application-defined (e.g. `"call:offer"`, `"chat"`) |
| `data` | no | Payload (any JSON value) |

**Routing rules:**

| `to` value | Behaviour |
|------------|-----------|
| `"user\|id"` | Direct to specific peer session |
| `"user"` | Broadcast to user's room |
| omitted | Broadcast to all sender's rooms (excluding sender) |
| `["room1", "room2"]` | Broadcast to specific rooms |

Direct messages (`to: "user|id"`) require sender and recipient to share at least one room. Messages to peers without a shared room are silently dropped.

### presence (bidirectional, routed)

Peer status updates. Server broadcasts to all rooms the peer has joined.

```json
{
  "type": "presence",
  "from": "alice|a1b2c3d4",
  "data": {
    "id": "a1b2c3d4",
    "user": "alice",
    "name": "Alice",
    "online": true
  },
  "probe": false
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"presence"` |
| `from` | yes | Sender address |
| `to` | no | Specific recipient (for directed presence) |
| `data` | yes | Peer object with at least `id`, `user`, `online` |
| `probe` | no | If `true`, requests recipient to send their presence back |

**Automatic presence:**
- Server broadcasts `online: true` when a peer authenticates
- Server broadcasts `online: false` when a peer disconnects
- Server strips `token` from presence broadcasts

### command (bidirectional, routed)

Structured commands with node/action addressing.

```json
{
  "type": "command",
  "from": "alice|a1b2c3d4",
  "to": "bob|x9y8z7w6",
  "node": "media:video",
  "action": "start",
  "data": {}
}
```

### event (bidirectional, routed)

Named events with arbitrary data.

```json
{
  "type": "event",
  "from": "alice|a1b2c3d4",
  "to": "bob|x9y8z7w6",
  "name": "typing",
  "data": {}
}
```

### join (client → server)

Join a room (requires `dynamicRooms: true`).

```json
{"type": "join", "room": "public"}
```

Server response: `{"type": "join:ok", "room": "public"}`

### leave (client → server)

Leave a room.

```json
{"type": "leave", "room": "public"}
```

Server response: `{"type": "leave:ok", "room": "public"}`

### close (client → server)

Graceful disconnect.

```json
{"type": "close"}
```

## Addressing

Peers are addressed as `user|id`:

- `user` -- identifier from auth
- `id` -- server-assigned session ID from welcome
- `user|id` -- fully qualified (routes to specific session)
- `user` alone -- routes to user's room

## Rooms

Rooms are the permission boundary for messaging and presence.

- Every peer auto-joins a room named after their `user` field
- Additional rooms from auth hook, Redis session, or auth message
- With `dynamicRooms`, peers can join/leave at runtime
- Direct messages require a shared room
- Room names are arbitrary strings

## Status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden (no shared room) |
| 404 | Peer not found |
| 408 | Auth timeout |
| 500 | Internal server error |

## v3 → v4 changes

| Feature | v3 (Socket.IO) | v4 (WebSocket) |
|---------|----------------|----------------|
| Transport | Socket.IO (Engine.IO + polling) | Native WebSocket |
| Handshake | Socket.IO connect + auth middleware | `auth` message as first frame |
| Heartbeat | Engine.IO ping/pong (app bytes) | WebSocket ping/pong (protocol frames) |
| Events | `socket.emit('message', data)` | `ws.send(JSON.stringify(data))` |
| Rooms | Socket.IO rooms | Server-managed sets (same semantics) |

The message format (`type`, `from`, `to`, `data`) is unchanged from v3. Client application code (CallManager, WebRTCPlayer, roster) is unaffected.
