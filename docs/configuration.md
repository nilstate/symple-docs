---
title: Configuration
description: Server configuration reference
---

# Configuration

The symple server reads configuration from environment variables via `config.js`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` or `SYMPLE_PORT` | 4500 | Listen port |
| `SYMPLE_AUTHENTICATION` | false | Require token auth (accepts: `true`, `1`, `yes`, `on`) |
| `SYMPLE_DYNAMIC_ROOMS` | true | Allow runtime room join/leave |
| `SYMPLE_SESSION_TTL` | -1 | Session timeout in minutes (-1 = no expiry) |
| `SYMPLE_REDIS_URL` or `REDIS_URL` | - | Redis connection URL |
| `SYMPLE_REDIS_HOST` / `SYMPLE_REDIS_PORT` | - | Alternative to URL (builds `redis://host:port`) |
| `SYMPLE_REDIS_PROTOCOL` | redis | Protocol for built URL (`redis` or `rediss`) |
| `SYMPLE_SSL_ENABLED` | false | Enable HTTPS/WSS |
| `SYMPLE_SSL_KEY` | - | Path to SSL private key file |
| `SYMPLE_SSL_CERT` | - | Path to SSL certificate file |

## Programmatic configuration

Pass a config object to the constructor:

```javascript
const Symple = require('symple-server')

const server = new Symple({
  port: 4500,
  authentication: true,
  dynamicRooms: false,
  sessionTTL: 10080,       // 1 week in minutes
  redis: 'redis://localhost:6379',
  ssl: {
    enabled: true,
    key: '/path/to/key.pem',
    cert: '/path/to/cert.pem'
  }
})

server.init()
```

Environment variables take precedence -- `PORT` overrides `config.port`.

## SSL / TLS

For production, enable WSS:

```bash
SYMPLE_SSL_ENABLED=true
SYMPLE_SSL_KEY=/etc/ssl/private/symple.key
SYMPLE_SSL_CERT=/etc/ssl/certs/symple.crt
```

If `SYMPLE_SSL_ENABLED` is true but key/cert paths are missing, the server falls back to HTTP with a warning.

## Redis connection

Redis is optional. Without it:
- Token authentication is unavailable (no session storage)
- Horizontal scaling is unavailable (no pub/sub)
- Everything else works as a single-instance server

With Redis:
- Sessions stored at `symple:session:<token>`
- Cross-instance messaging via `symple:broadcast` channel
- Server automatically subscribes on `init()`
