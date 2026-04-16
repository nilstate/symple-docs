---
title: Quickstart
description: Run a symple server and connect a client in five minutes
---

# Quickstart

This guide gets a symple server running and connects a JavaScript client to it. By the end you will have two peers exchanging messages in real time.

## Prerequisites

- Node.js 18 or later
- npm or yarn

## Install the server

```bash
mkdir symple-demo && cd symple-demo
npm init -y
npm install symple-server
```

Create `server.js`:

```javascript
const { SympleServer } = require("symple-server");

const server = new SympleServer({
  port: 4500,
  authentication: false,
  dynamicRooms: true,
});

server.on("connection", (peer) => {
  console.log("peer connected:", peer.user, peer.id);
});

server.on("disconnection", (peer) => {
  console.log("peer disconnected:", peer.user, peer.id);
});

server.start();
console.log("symple server listening on ws://localhost:4500");
```

Start it:

```bash
node server.js
```

## Install the client

In a separate directory or a browser project:

```bash
npm install symple-client
```

## Connect two peers

Create `alice.js`:

```javascript
const { SympleClient } = require("symple-client");

const client = new SympleClient({
  url: "ws://localhost:4500",
  peer: {
    user: "alice",
    name: "Alice",
    type: "person",
  },
});

client.on("connect", () => {
  console.log("alice connected");
  client.join("demo-room");
});

client.on("message", (msg) => {
  console.log("alice received:", msg.data);
});

client.connect();
```

Create `bob.js`:

```javascript
const { SympleClient } = require("symple-client");

const client = new SympleClient({
  url: "ws://localhost:4500",
  peer: {
    user: "bob",
    name: "Bob",
    type: "person",
  },
});

client.on("connect", () => {
  console.log("bob connected");
  client.join("demo-room");

  // send a message to the room after a short delay
  setTimeout(() => {
    client.sendMessage({
      to: "demo-room",
      subtype: "chat",
      data: { text: "Hello from Bob!" },
    });
  }, 1000);
});

client.on("message", (msg) => {
  console.log("bob received:", msg.data);
});

client.connect();
```

Run both in separate terminals:

```bash
node alice.js
node bob.js
```

Alice receives Bob's message because they share the `demo-room` room.

## Send a direct message

To message a specific peer instead of broadcasting to a room, set `to` to their address:

```javascript
// bob sends directly to alice
client.sendMessage({
  to: "alice|<session-id>",
  subtype: "chat",
  data: { text: "Private message" },
});
```

The session ID is assigned by the server on connection. You can discover peer addresses through presence events -- see [presence](presence) for details.

## Browser usage

The client works in browsers via a bundler (webpack, vite, esbuild):

```javascript
import { SympleClient } from "symple-client";

const client = new SympleClient({
  url: "ws://localhost:4500",
  peer: { user: "browser-user", name: "Browser" },
});

client.on("connect", () => {
  console.log("connected from browser");
});

client.connect();
```

For production, use `wss://` with TLS. See [configuration](configuration) for SSL setup.

## What to read next

- [Protocol](protocol) -- understand the wire format and message types
- [JavaScript client](javascript-client) -- full API reference
- [Server](server) -- server configuration and event handling
- [WebRTC signalling](webrtc-signalling) -- add video calling to your application
