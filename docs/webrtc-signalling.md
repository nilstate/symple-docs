---
title: WebRTC Signalling
description: Call lifecycle and SDP/ICE exchange
---

# WebRTC Signalling

Symple provides a complete WebRTC call signalling flow built on top of regular messaging. Call control messages use `type: 'message'` with a `subtype` prefix of `call:`.

## Call subtypes

| Subtype | Direction | Purpose |
|---------|-----------|---------|
| `call:init` | Caller → Callee | Initiate a call |
| `call:accept` | Callee → Caller | Accept the call |
| `call:reject` | Callee → Caller | Reject (with optional reason) |
| `call:offer` | Caller → Callee | SDP offer |
| `call:answer` | Callee → Caller | SDP answer |
| `call:candidate` | Both | ICE candidate (trickle) |
| `call:hangup` | Either | End the call |

## Call lifecycle

### Caller side

1. `call(peerId)` → state = RINGING, send `call:init`
2. Receive `call:accept` → state = CONNECTING, create WebRTCPlayer as initiator
3. Player acquires local media, creates SDP offer → send `call:offer`
4. Receive `call:answer` with remote SDP
5. Exchange ICE candidates via `call:candidate`
6. State = ACTIVE when media flows
7. `hangup()` or receive `call:hangup` → state = ENDED

### Callee side

1. Receive `call:init` → state = INCOMING, emit `incoming` event
2. User calls `accept()` → state = CONNECTING, send `call:accept`, create WebRTCPlayer as non-initiator
3. Receive `call:offer` with remote SDP
4. Player creates SDP answer → send `call:answer`
5. Exchange ICE candidates
6. State = ACTIVE when media flows

## ICE candidate buffering

Candidates that arrive before the remote SDP description is set are buffered in `_pendingCandidates`. When the remote description is set, buffered candidates are flushed to the peer connection. This handles the race condition that most WebRTC implementations get wrong.

## Call states

```javascript
import { CallState } from 'symple-player'

CallState.IDLE        // No active call
CallState.RINGING     // Outgoing call, waiting for accept
CallState.INCOMING    // Incoming call, waiting for user action
CallState.CONNECTING  // Accepted, WebRTC negotiation in progress
CallState.ACTIVE      // Media flowing
CallState.ENDED       // Call ended (resets to IDLE)
```

## Message format

```json
{
  "type": "message",
  "subtype": "call:offer",
  "from": "alice|session-abc",
  "to": "bob|session-xyz",
  "data": {
    "type": "offer",
    "sdp": "v=0\r\no=- ..."
  }
}
```

ICE candidate:

```json
{
  "type": "message",
  "subtype": "call:candidate",
  "from": "alice|session-abc",
  "to": "bob|session-xyz",
  "data": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

## Separation of concerns

The symple server doesn't know anything about WebRTC. It routes `call:*` messages like any other message. The call lifecycle is entirely client-side. This means:

- Signalling goes through the server
- Media flows peer-to-peer (or through a TURN relay)
- The server never touches media data
