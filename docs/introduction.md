---
title: Introduction
description: What symple is and why it exists
---

# Introduction

Symple is a real-time messaging and presence protocol built on WebSocket transport with JSON text frames. It provides the signalling backbone for WebRTC applications, media streaming, and any system that needs lightweight peer-to-peer communication with presence awareness.

## What symple does

Symple handles three concerns that every real-time application needs:

- **Messaging** -- structured JSON messages between peers, with broadcast, direct, and multicast delivery modes
- **Presence** -- online/offline tracking with capability advertisement so peers know what each other can do
- **Signalling** -- a complete WebRTC call signalling flow built on top of the messaging layer

It does not handle media transport. Symple is the control plane; your media flows over WebRTC data channels, MJPEG streams, or whatever transport suits your application.

## Architecture

The symple ecosystem is split across several packages:

| Package | Language | Purpose |
|---------|----------|---------|
| **symple-server** | Node.js | WebSocket server with optional Redis scaling |
| **symple-client** | JavaScript | Browser and Node.js client, 9KB minified |
| **symple-player** | JavaScript | Media engine integrations: WebRTC, MJPEG, webcam |
| **symple-client-ruby** | Ruby | Server-side message emitter via Redis pub/sub |
| **icey C++ module** | C++ | Native server and client, same wire protocol |

All implementations share the same v4 wire protocol. A JavaScript client can communicate with a C++ server, a Ruby backend can push messages to browser clients, and everything interoperates without translation layers.

## Protocol at a glance

Every symple message is a JSON object with a `type` field. The protocol defines a small set of message types:

```
auth, welcome, error, message, presence, command, event, join, leave, close
```

Peers are addressed using a pipe-delimited format: `user|session-id`. Messages without a `to` field broadcast to all peers in shared rooms. Messages with a `to` string go directly to one peer. Messages with a `to` array multicast to specific rooms.

Peers must share at least one room to exchange direct messages. This is the permission boundary -- there is no global message bus.

## Design principles

**Small wire format.** Messages are plain JSON objects with a handful of well-known fields. No binary encoding, no schema negotiation, no version handshake beyond the initial auth exchange.

**Transport agnostic messaging.** The protocol describes message semantics, not transport details. The reference implementation uses WebSocket, but any bidirectional channel that can carry JSON text frames works.

**Separation of concerns.** Symple handles signalling and presence. Media flows through WebRTC, MJPEG, or your own transport. The `symple-player` package bridges this gap with ready-made media engine integrations, but it is entirely optional.

**Horizontal scaling.** A single symple-server instance handles thousands of concurrent connections. When that is not enough, add Redis pub/sub and run multiple instances behind a load balancer. No code changes required -- just set `SYMPLE_REDIS_URL`.

## Next steps

- Follow the [quickstart](quickstart) to run a server and connect a client in under five minutes
- Read the [protocol](protocol) reference for the full wire format specification
- Explore [WebRTC signalling](webrtc-signalling) if you are building a video calling application
