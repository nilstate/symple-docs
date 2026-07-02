---
title: Sessions and Peer API
description: Source-mapped authentication, session, disconnect, and Peer model methods
---

# Sessions and Peer API

The server and model references below are pinned to `symple-server` commit
[`fbe14ed`](https://github.com/nilstate/symple-server/tree/fbe14edc843535ae5f5319f992b89ba1fe379142).

## Authentication and sessions

### `onAuth(ws, req, msg)`

Validates the user, loads a Redis session when authentication is enabled,
applies the optional asynchronous `authenticate(peer, auth)` hook, joins
authorized rooms, registers the peer, sends `welcome`, and broadcasts online
presence.

[Source: lines 199-307](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L199-L307)

### `getSession(token, fn)`

Reads `symple:session:<token>` from Redis and returns a parsed object through
the Node-style callback. Missing, malformed, and Redis-error cases are
reported explicitly.

[Source: lines 492-506](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L492-L506)

### `touchSession(token, fn)`

Extends a Redis session expiry from `sessionTTL`; a value of `-1` disables
expiry updates.

[Source: lines 509-518](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L509-L518)

### `onDisconnect(ws)`

Marks the peer offline, broadcasts final presence, removes all room
memberships, and clears the peer and socket indexes.

[Source: lines 351-379](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L351-L379)

### `parseAddress(str)`

Parses `user` or `user|peerId` into an address object.

[Source: lines 521-529](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L521-L529)

### `randomId()`

Produces the non-cryptographic session identifier used for connected peers.

[Source: lines 531-535](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L531-L535)

## Peer model

### `new Peer(data)`

Creates a peer and copies the supplied session fields when present.

[Source: `lib/peer.js` lines 13-17](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L13-L17)

### `read(from)`

Copies own enumerable properties from an input object onto the peer.

[Source: lines 19-25](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L19-L25)

### `write(to)`

Copies the peer's own enumerable properties into a destination object.

[Source: lines 27-33](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L27-L33)

### `toPresence(p)`

Builds a presence envelope, removes a string token from public peer data, and
applies a valid display-name update.

[Source: lines 35-52](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L35-L52)

### `toPeer(p)`

Serializes peer fields into a supplied or new object.

[Source: lines 54-58](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L54-L58)

### `address()`

Returns the canonical `user|id` address.

[Source: lines 60-62](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L60-L62)

### `valid()`

Accepts peers only when both `id` and `user` are truthy.

[Source: lines 64-66](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/peer.js#L64-L66)

