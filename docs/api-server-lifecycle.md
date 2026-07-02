---
title: Server lifecycle API
description: Source-mapped lifecycle and transport methods in the Symple v4 server
---

# Server lifecycle API

This reference is pinned to `symple-server` commit
[`fbe14ed`](https://github.com/nilstate/symple-server/tree/fbe14edc843535ae5f5319f992b89ba1fe379142).
Every method links to the exact source used for this page.

## Construction and startup

### `new Symple(config)`

Creates the in-memory peer, room, and WebSocket lookup maps. The configuration
accepts the HTTP port, Redis URL, SSL settings, session lifetime,
authentication mode, and dynamic-room policy.

[Source: `lib/symple.js` lines 25-31](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L25-L31)

### `init()`

Starts the HTTP transport, attaches the WebSocket server, and initializes the
optional Redis clients.

[Source: lines 33-38](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L33-L38)

### `shutdown()`

Broadcasts a shutdown event, closes connected sockets and transports, quits
Redis clients, and clears all in-memory indexes.

[Source: lines 40-60](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L40-L60)

## Transport initialization

### `initHTTP()`

Creates an HTTP or HTTPS server once. `PORT` overrides `config.port`; HTTPS
reads the configured key and certificate files.

[Source: lines 63-76](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L63-L76)

### `initWebSocket()`

Attaches `WebSocketServer` to the HTTP server. A new connection must
authenticate within ten seconds. After authentication, message types are
dispatched to routing, room, leave, or close handlers.

[Source: lines 79-145](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L79-L145)

### `initRedis()`

Creates the command and subscription clients when `config.redis` is set, then
subscribes to `symple:broadcast` for server-side message injection.

[Source: lines 148-173](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L148-L173)

## Extension and error hooks

### `onAuthorize(ws, peer)`

Override this no-op hook to run application logic after a peer has been
successfully registered.

[Source: lines 458-461](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L458-L461)

### `sendError(ws, status, message)`

Sends a protocol error envelope and ignores a send failure caused by a socket
that has already closed.

[Source: lines 463-468](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L463-L468)

### `onRedisError(err)`

Reports a Redis client error to standard error.

[Source: lines 488-490](https://github.com/nilstate/symple-server/blob/fbe14edc843535ae5f5319f992b89ba1fe379142/lib/symple.js#L488-L490)

