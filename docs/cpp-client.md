---
title: C++ Client
description: Native C++ implementation in icey
---

# C++ Client

The icey C++ library includes a full symple implementation: both client and server. Same v4 wire protocol as the JavaScript implementation, running on libuv with native WebSocket transport.

## Overview

The C++ symple module provides:

- `smpl::Client` -- connects to a symple server, manages presence and messaging
- `smpl::Server` -- standalone symple server with auth hooks, rate limiting, and virtual peers
- `smpl::Peer`, `smpl::Roster`, `smpl::Address` -- data types
- `smpl::Message`, `smpl::Command`, `smpl::Presence`, `smpl::Event` -- message types
- `smpl::Form` -- structured data exchange (forms with pages, sections, fields)
- WebRTC integration via `wrtc::SympleSignaller`

The C++ and JavaScript implementations interoperate. A browser running symple-client can connect to a C++ symple server, or a C++ client can connect to the Node.js server.

## Where to find it

The C++ symple module lives in the [icey](/icey) repository at `src/symple/`. Full API reference and module documentation is available in the [icey docs](/icey/docs/concepts/modules/symple.html).

## Example: console client

icey ships a sample console client at `src/symple/samples/sympleconsole/`:

```cpp
smpl::Client::Options opts;
opts.host = "localhost";
opts.port = 4500;
opts.user = "alice";
opts.name = "Alice";

smpl::Client client(opts);

client.StateChange += [](void*, smpl::ClientState& state, const smpl::ClientState&) {
  // Handle state transitions
};

client.PeerConnected += [](smpl::Peer& peer) {
  std::cout << "Peer connected: " << peer.address() << '\n';
};

client.start();
uv::runLoop();
```

## WebRTC signalling

The C++ client integrates with icey's WebRTC module via `SympleSignaller`:

```cpp
smpl::Client symple(opts);
wrtc::SympleSignaller signaller(symple);
wrtc::PeerSession session(signaller, rtcConfig);

session.IncomingCall += [&](const std::string& peerId) {
  session.accept();
};

symple.start();
session.call(remotePeerId);
uv::runLoop();
```

This is how icey achieves camera-to-browser streaming in under 150 lines -- symple handles signalling, icey handles media.

## Further reading

- [icey symple module guide](/icey/docs/concepts/modules/symple.html) -- full C++ API reference
- [icey WebRTC module](/icey/docs/concepts/modules/webrtc.html) -- WebRTC integration
- [icey architecture](/icey/docs/concepts/architecture.html) -- how modules compose
