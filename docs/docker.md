---
title: Docker
description: Deploying symple with Docker
---

# Docker

## Docker Compose

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  symple:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./symple-server:/app
    command: npm start
    ports:
      - "4500:4500"
    environment:
      PORT: 4500
      SYMPLE_AUTHENTICATION: "true"
      SYMPLE_DYNAMIC_ROOMS: "false"
      SYMPLE_REDIS_URL: redis://redis:6379
    depends_on:
      - redis
```

## Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4500
CMD ["node", "server.js"]
```

## Scaling

Run multiple instances behind a load balancer. As long as all instances point to the same Redis, cross-instance messaging works automatically:

```yaml
services:
  symple:
    deploy:
      replicas: 3
    environment:
      SYMPLE_REDIS_URL: redis://redis:6379
```

No sticky sessions required -- session tokens are in Redis, and any instance can validate them.

## Health checks

The HTTP server responds to any non-WebSocket request. Use it as a health check endpoint:

```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:4500/"]
  interval: 30s
  timeout: 5s
  retries: 3
```

## Production checklist

- Enable SSL (`SYMPLE_SSL_ENABLED=true`) or terminate TLS at the load balancer
- Set `SYMPLE_AUTHENTICATION=true` with Redis for token validation
- Set `SYMPLE_DYNAMIC_ROOMS=false` unless clients need to join rooms at runtime
- Set `SYMPLE_SESSION_TTL` to a reasonable value (e.g. 10080 for one week)
- Configure Redis persistence if session durability matters
