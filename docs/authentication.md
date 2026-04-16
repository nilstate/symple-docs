---
title: Authentication
description: Token-based authentication for symple peers
---

# Authentication

Symple supports anonymous and token-based auth modes.

## Anonymous mode

With `authentication: false` (default), any client can connect by providing a `user` field:

```javascript
const client = new SympleClient({
  url: 'ws://localhost:4500',
  peer: { user: 'alice', name: 'Alice' }
})
```

## Token-based auth

With `authentication: true`, the client must provide a valid token:

```javascript
const client = new SympleClient({
  url: 'ws://localhost:4500',
  token: 'session-token',
  peer: { user: 'alice', name: 'Alice' }
})
```

The server looks up `symple:session:<token>` in Redis. If the key doesn't exist, auth fails with 401.

## Session management

Sessions are stored as JSON in Redis. Any system that can write to Redis can create sessions.

### From Ruby

```ruby
session = Symple::Session.new(redis: $redis)

# Create on login
session.set(token, {
  user: user.username,
  name: user.display_name,
  rooms: user.teams.pluck(:slug)
}, ttl: 1.week.to_i)

# Extend TTL
session.touch(token, ttl: 1.week.to_i)

# Delete on logout
session.delete(token)
```

### From any language

```
SET symple:session:my-token '{"user":"alice","name":"Alice","rooms":["team-a"]}'
EXPIRE symple:session:my-token 604800
```

Session data merges with the auth message. Rooms in the session are joined automatically.

## Custom auth hook

For validation beyond Redis lookup:

```javascript
server.authenticate = async (peer, auth) => {
  const user = await db.users.findByToken(auth.token)
  if (!user) return { allowed: false, message: 'Invalid token' }
  return { allowed: true, rooms: user.teams }
}
```

## Auth flow

1. Client opens WebSocket
2. Client sends `{ type: 'auth', user: '...', token: '...' }`
3. Server validates (Redis lookup and/or auth hook)
4. Success: `welcome` message with session ID and rooms
5. Failure: `error` with status 401, connection closed
6. Timeout: 10 seconds, connection closed with status 408
