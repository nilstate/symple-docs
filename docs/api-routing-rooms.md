---
title: Routing and rooms API
description: Source-mapped message routing and room management methods
---

# Routing and rooms API

This page maps the routing surface at `symple-server` commit
[`fbe14ed`](https://github.com/nilstate/symple-server/tree/fbe14edc843535ae5f5319f992b89ba1fe379142).

## Incoming messages

### `onRedisMessage(msg)`

Routes Redis pub/sub messages to a peer address, a user room, or each room in
an array. Invalid and unsupported payloads are ignored.

[Source: lines 176-196](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L176-L196)

### `onMessage(entry, msg)`

Replaces the client-supplied `from` value with the authenticated peer address
before routing, preventing sender spoofing.

[Source: lines 310-314](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L310-L314)

### `route(sender, msg)`

Implements the `to` contract:

- omitted: broadcast to all sender rooms;
- `user|peerId`: direct send only when sender and recipient share a room;
- `user`: broadcast to the user's room;
- string array: broadcast to every named room.

[Source: lines 390-420](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L390-L420)

## Room membership

### `onJoin(entry, room)`

Adds a peer to a room only when dynamic rooms are enabled, then returns
`join:ok`. Otherwise it sends an error without changing membership.

[Source: lines 317-335](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L317-L335)

### `onLeave(entry, room)`

Removes membership from both the peer entry and room index, then returns
`leave:ok`.

[Source: lines 338-348](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L338-L348)

### `sharesRoom(entryA, entryB)`

Returns `true` as soon as two peers have one room in common. Direct-message
authorization uses this check.

[Source: lines 382-387](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L382-L387)

### `addToRoom(room, peerId)`

Creates a room set when needed and adds the peer ID.

[Source: lines 470-475](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L470-L475)

### `removeFromRoom(room, peerId)`

Deletes a peer ID and removes the room itself when no members remain.

[Source: lines 477-485](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L477-L485)

## Outbound delivery

### `broadcast(sender, msg)`

Broadcasts to each room occupied by the sender while excluding that sender.

[Source: lines 423-427](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L423-L427)

### `broadcastToRoom(room, msg, excludeId)`

Serializes once and sends to each connected room member except `excludeId`.

[Source: lines 430-442](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L430-L442)

### `sendTo(peerId, msg)`

Sends to one connected peer and reports success as a boolean.

[Source: lines 445-455](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L445-L455)

