---
title: Scaling
description: Horizontal scaling with Redis pub/sub
---

# Scaling

A single symple server handles thousands of concurrent connections. For more, add Redis pub/sub and run multiple instances behind a load balancer.

## Setup

Set the Redis URL on each server instance:

```bash
SYMPLE_REDIS_URL=redis://redis:6379 node server.js
```

Or in code:

```javascript
const server = new Symple({
  port: 4500,
  redis: 'redis://redis:6379'
})
```

No code changes required. The server automatically subscribes to Redis pub/sub for cross-instance messaging.

## How it works

Each server process subscribes to the `symple:broadcast` Redis channel. When a message arrives on this channel, the server routes it to local peers based on the `to` field.

This is how the Ruby client works -- it publishes messages directly to `symple:broadcast` without maintaining a WebSocket connection:

```ruby
emitter = Symple::Emitter.new(
  redis: $redis,
  from: user.id.to_s,
  rooms: ['team-a']
)

emitter.emit({
  type: 'message',
  data: { text: 'From Rails' }
})
```

## Session sharing

Session data lives in Redis at `symple:session:<token>`. Any server instance can validate tokens, so clients can connect to any instance. No sticky sessions required.

## Architecture

```
        Load Balancer
        /           \
  Server A         Server B
  (ws peers)       (ws peers)
        \           /
         Redis
        /     \
  pub/sub    sessions
```

Each server maintains its own in-memory peer and room maps. Cross-server messaging goes through Redis. Session tokens are shared via Redis keys.
