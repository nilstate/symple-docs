---
title: Presence
description: Peer presence tracking and capability advertisement
---

# Presence

Presence tracks which peers are online and what they can do. Presence updates are regular messages with `type: 'presence'`.

## How it works

1. Peer authenticates -- server broadcasts online presence to all shared rooms
2. New peer sends a presence probe on connect
3. Existing peers respond with their current state (without the probe flag, preventing loops)
4. Peer disconnects -- server broadcasts offline presence

## Presence message

```json
{
  "type": "presence",
  "from": "alice|session-abc",
  "data": {
    "user": "alice",
    "name": "Alice",
    "id": "session-abc",
    "online": true
  }
}
```

## The roster

The client-side `Roster` tracks peers in memory, updating automatically from presence messages:

```javascript
// Get a peer by ID or address
const alice = client.roster.get('alice|session-abc')

// Find by properties
const peer = client.roster.findOne({ user: 'alice' })

// Listen for changes
client.on('addPeer', (peer) => {
  console.log('online:', peer.user)
})

client.on('removePeer', (peer) => {
  console.log('offline:', peer.user)
})
```

## Capabilities

Peers advertise capabilities -- key-value pairs describing what they support:

```javascript
client.addCapability('video', true)
client.addCapability('maxResolution', '1080p')

// Check remote peer capabilities
if (client.hasCapability('alice|session-abc', 'video')) {
  // Alice supports video calls
}

const res = client.getCapability('alice|session-abc', 'maxResolution')
```

Calling `removeCapability()` automatically broadcasts a presence update.

## Manual presence

```javascript
// Broadcast current state
client.sendPresence()

// With additional data
client.sendPresence({ data: { status: 'away' } })
```

The client merges peer data into the presence message automatically.

## Security

The server strips the `token` field from presence broadcasts. Auth tokens are never leaked to other peers.
