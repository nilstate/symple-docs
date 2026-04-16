---
title: Ruby Client
description: Server-side messaging from Rails via Redis
---

# Ruby Client

`symple-client-ruby` provides server-side message emission from Ruby/Rails backends. It publishes Symple-compatible messages directly to Redis pub/sub -- no WebSocket connection from Ruby.

## Install

```ruby
# Gemfile
gem 'symple-client-ruby'
```

## Session management

The `Session` class manages auth tokens in Redis:

```ruby
session = Symple::Session.new(redis: $redis)

# Create a session (on login)
session.set(token, {
  user: user.username,
  name: user.display_name,
  rooms: user.teams.pluck(:slug)
}, ttl: 1.week.to_i)

# Read session data
data = session.get(token)
# => { "user" => "alice", "name" => "Alice", "rooms" => ["team-a"] }

# Extend TTL (on activity)
session.touch(token, ttl: 1.week.to_i)

# Check existence
session.exists?(token)

# Delete (on logout)
session.delete(token)
```

Sessions are stored at `symple:session:<token>` in Redis. The symple server reads these when `authentication: true`.

## Emitting messages

The `Emitter` publishes messages to the `symple:broadcast` Redis channel. The symple server subscribes to this channel and routes messages to connected WebSocket peers.

```ruby
emitter = Symple::Emitter.new(
  redis: $redis,
  from: user.id.to_s,
  rooms: ['team-a']
)

# Send a message
emitter.emit({
  type: 'message',
  data: { text: 'Hello from Rails' }
})

# Convenience methods
emitter.send({ text: 'Hi!' })
emitter.send_presence(user: user.username, name: user.display_name, online: true)
emitter.send_event('chat.typing', { user_id: current_user.id, typing: true })
```

## Chaining API

The emitter supports method chaining for building messages:

```ruby
Symple::Emitter.new(redis: $redis)
  .from(user.id.to_s)
  .to('team-a')
  .emit(type: 'message', data: { text: 'Hi!' })
```

## Session creation from emitter

The emitter can also manage sessions:

```ruby
emitter = Symple::Emitter.new(redis: $redis)

# Create a session
emitter.create_session(token, {
  user: 'alice',
  rooms: ['team-a']
}, ttl: 604800)

# Delete a session
emitter.destroy_session(token)
```

## How it works

```
Rails model callback → Emitter.emit() → Redis PUBLISH symple:broadcast
                                                  ↓
                                        Symple Server(s) subscribe
                                                  ↓
                                        Route to WebSocket peers
```

No WebSocket connection from Ruby. No round-trip. The message goes directly to Redis, and every symple server instance picks it up and delivers to local peers.
