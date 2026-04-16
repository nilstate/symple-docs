---
title: CallManager
description: High-level call orchestration
---

# CallManager

The `CallManager` wires SympleClient messaging to WebRTCPlayer to provide a complete call flow. It maps symple message events to WebRTC methods and player events back to symple messages.

## Install

```bash
npm install symple-player
```

## Usage

```javascript
import SympleClient from 'symple-client'
import CallManager from 'symple-player/src/call-manager.js'

const client = new SympleClient({
  url: 'ws://localhost:4500',
  peer: { user: 'alice', name: 'Alice' }
})

const calls = new CallManager(client, document.getElementById('video'), {
  rtcConfig: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  },
  mediaConstraints: { audio: true, video: true }
})

client.connect()
```

## Making a call

```javascript
calls.call('bob|session-id')

calls.on('accepted', (peerId) => {
  console.log('call accepted')
})

calls.on('active', (peerId) => {
  console.log('media flowing')
})
```

## Handling incoming calls

```javascript
calls.on('incoming', (peerId, message) => {
  if (confirm('Accept call from ' + peerId + '?')) {
    calls.accept()
  } else {
    calls.reject('declined')
  }
})
```

If already in a call, incoming calls are auto-rejected with reason `busy`.

## Ending a call

```javascript
calls.hangup('user ended')
```

## Media controls

```javascript
calls.muteAudio(true)   // mute outgoing audio
calls.muteVideo(true)   // mute outgoing video
calls.mute(true)         // mute incoming audio
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `incoming` | peerId, message | Incoming call received |
| `ringing` | peerId | Outgoing call initiated |
| `accepted` | peerId | Remote accepted |
| `rejected` | peerId, reason | Remote rejected |
| `connecting` | peerId | WebRTC negotiation started |
| `active` | peerId | Media flowing |
| `ended` | peerId, reason | Call ended |
| `error` | Error | Call error |
| `localstream` | MediaStream | Local media acquired |
| `remotestream` | MediaStream | Remote media received |

## Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rtcConfig` | object | Google STUN servers | `RTCConfiguration` for the peer connection |
| `mediaConstraints` | object | `{ audio: true, video: true }` | `getUserMedia` constraints |
| `localMedia` | boolean | true | Acquire local media (false for receive-only) |
| `receiveMedia` | boolean | true | Expect remote media (false for send-only) |

## Cleanup

```javascript
calls.destroy()
```

Hangs up any active call and unbinds client message handlers.
