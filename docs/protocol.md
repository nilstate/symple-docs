---
title: Protocol
description: Symple v4 wire protocol specification
---

# Protocol

Symple uses a JSON-based wire protocol over WebSocket. Every message is a single JSON text frame with a `type` field that determines its structure and handling.

## Protocol version

The current protocol version is **v4**. The version is not negotiated during connection -- the server and client must agree on the protocol version at deployment time.

## Connection lifecycle

A symple connection follows this sequence:

```
Client                          Server
  |                               |
  |--- WebSocket connect -------->|
  |                               |
  |--- auth message ------------->|
  |                               |
  |<-- welcome or error ----------|
  |                               |
  |<-- presence (existing peers)->|
  |                               |
  |<=> messages, presence, etc <=>|
  |                               |
  |--- close -------------------->|
  |                               |
```

1. The client opens a WebSocket connection to the server
2. The client sends an `auth` message with credentials and peer metadata
3. The server responds with either a `welcome` message (success) or an `error` message (failure)
4. On success, the server sends presence announcements for existing peers in shared rooms
5. The connection is now live -- both sides can send any message type
6. Either side can close the connection at any time

## Message types

### auth

Sent by the client immediately after WebSocket connection. Contains peer identity and optional credentials.

```json
{
  "type": "auth",
  "token": "optional-auth-token",
  "peer": {
    "user": "alice",
    "name": "Alice",
    "type": "person"
  }
}
```

### welcome

Sent by the server after successful authentication. Contains the assigned session ID and peer metadata.

```json
{
  "type": "welcome",
  "id": "session-abc123",
  "peer": {
    "user": "alice",
    "name": "Alice",
    "type": "person",
    "id": "session-abc123"
  }
}
```

### error

Sent by the server when authentication fails or a protocol error occurs.

```json
{
  "type": "error",
  "message": "Authentication failed",
  "status": 401
}
```

### message

General-purpose message between peers. The `subtype` field differentiates message categories.

```json
{
  "type": "message",
  "id": "msg_abc",
  "from": "alice|session-abc",
  "to": "bob|session-xyz",
  "subtype": "chat",
  "data": {
    "text": "Hello, Bob"
  },
  "status": 200
}
```

### presence

Announces a peer's online status and capabilities. See [presence](presence) for details.

```json
{
  "type": "presence",
  "from": "alice|session-abc",
  "data": {
    "online": true,
    "capabilities": ["video", "audio", "screen-share"]
  }
}
```

### command

A request-response style message for invoking actions on a remote peer.

```json
{
  "type": "command",
  "id": "cmd_001",
  "from": "alice|session-abc",
  "to": "bob|session-xyz",
  "node": "media:start",
  "data": {
    "codec": "vp8"
  }
}
```

### event

A fire-and-forget notification. Unlike commands, events do not expect a response.

```json
{
  "type": "event",
  "from": "alice|session-abc",
  "to": "demo-room",
  "name": "typing",
  "data": {}
}
```

### join

Sent by the client to join a room, or by the server to confirm a join.

```json
{
  "type": "join",
  "room": "demo-room"
}
```

### leave

Sent by the client to leave a room, or by the server to confirm departure.

```json
{
  "type": "leave",
  "room": "demo-room"
}
```

### close

Sent by either side to gracefully terminate the connection.

```json
{
  "type": "close"
}
```

## Common fields

These fields appear across multiple message types:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Required. One of the message types listed above |
| `id` | string | Optional. Message identifier for correlation and responses |
| `from` | string | Sender address in `user\|session-id` format |
| `to` | string or array | Recipient. See [addressing](addressing) |
| `subtype` | string | Optional. Categorizes messages within a type |
| `data` | object | Optional. Arbitrary payload |
| `status` | number | Optional. HTTP-style status code for responses |

## Frame encoding

All messages are sent as WebSocket text frames containing a single JSON object. Binary frames are not used by the protocol. Each WebSocket frame contains exactly one message -- no batching, no framing within the JSON payload.

## Status codes

Symple uses HTTP-style status codes in the `status` field:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden (no shared room) |
| 404 | Peer not found |
| 500 | Internal server error |

## Extensibility

The protocol is extensible through the `data` field on any message type. Application-specific payloads go in `data` and are passed through without interpretation by the server. The `subtype` field provides a lightweight categorization mechanism without requiring new message types.
