---
title: Media Players
description: WebRTC, MJPEG, and webcam player engines
---

# Media Players

`symple-player` includes several media engine implementations. Each extends the base `Player` class and registers with the `Media` engine registry.

## Engine registry

Engines register with an ID, name, format list, preference score, and browser support flag:

```javascript
import Media from 'symple-player/src/media.js'

// Get the best available engine
const engine = Media.preferredEngine()

// List all compatible engines (sorted by preference)
const engines = Media.compatibleEngines()

// Check support
Media.supports('WebRTC')  // true if RTCPeerConnection exists
```

### Registered engines

| Engine | Preference | Formats | Requires |
|--------|-----------|---------|----------|
| WebRTC | 100 | VP8, VP9, H.264, H.265, AV1, Opus | RTCPeerConnection |
| MJPEG Native | 60 | MJPEG | Firefox/Chrome/Safari |
| MJPEG WebSocket | 50 | MJPEG | WebSocket |
| Webcam | 0 | JPEG, PNG | getUserMedia |

## WebRTCPlayer

Two-way video/audio using RTCPeerConnection. Uses the modern API: `getUserMedia` promises, `addTrack`/`ontrack`, `srcObject`, Unified Plan SDP, trickle ICE with candidate buffering.

```javascript
import WebRTCPlayer from 'symple-player/src/webrtc.js'

const player = new WebRTCPlayer(videoElement, {
  initiator: true,
  rtcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
  mediaConstraints: { audio: true, video: true },
  localMedia: true,     // acquire local camera/mic
  receiveMedia: true    // expect remote media
})

player.on('sdp', (desc) => { /* send to remote peer */ })
player.on('candidate', (candidate) => { /* send to remote peer */ })
player.on('localstream', (stream) => { /* local preview */ })
player.on('remotestream', (stream) => { /* remote video */ })

await player.play()
await player.recvRemoteSDP(remoteDesc)
await player.recvRemoteCandidate(candidate)

player.muteAudio(true)
player.muteVideo(true)
player.destroy()
```

Typically used via `CallManager` rather than directly.

## MJPEGPlayer

Native MJPEG streaming using `multipart/x-mixed-replace` via an `<img>` element:

```javascript
import { MJPEGPlayer } from 'symple-player/src/mjpeg.js'

const player = new MJPEGPlayer(containerElement)
player.play({ url: 'http://camera.local/stream.mjpg' })
player.stop()
```

## MJPEGWebSocketPlayer

MJPEG streaming over WebSocket binary frames:

```javascript
import { MJPEGWebSocketPlayer } from 'symple-player/src/mjpeg.js'

const player = new MJPEGWebSocketPlayer(containerElement)
player.play({ url: 'ws://camera.local/stream.ws' })
player.stop()
```

## WebcamPlayer

Local webcam capture and frame snapshot:

```javascript
import WebcamPlayer from 'symple-player/src/webcam.js'

const player = new WebcamPlayer(containerElement)
await player.play({ audio: false, video: true })

// Capture a frame as a Blob
const blob = await player.toBlob('image/jpeg', 0.75)

// Capture as canvas
const canvas = player.capture(0.5)  // 50% scale

player.destroy()
```

## Base Player class

All engines extend `Player`, which provides:

- DOM structure with screen, controls, and status areas
- State machine: `loading`, `playing`, `stopped`, `error`
- Built-in control actions: play, stop, mute, fullscreen
- Event emission: `state`, `action`

```javascript
player.on('state', (state, message) => {
  if (state === 'error') console.error(message)
})
```

Direct `<video>` or `<audio>` elements can be passed as the container -- the player detects media elements and skips DOM template injection.
