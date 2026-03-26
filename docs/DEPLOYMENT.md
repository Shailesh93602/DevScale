# Deployment & CI/CD Pipeline

Deploying **EduScale** follows a robust, GitOps-oriented CD/CI architecture utilizing Vercel, Railway, and GitHub Actions.

This document describes how to safely spin up production-grade iterations of the platform.

---

## 1. Environment & Infrastructure Setup

**Frontend Deployment (Vercel):**
Vercel handles the Next.js `App Router`, auto-configuring Edge Functions for SSR logic, Image Optimization, and globally resolving CDN nodes natively based on your deployment regions.

**Backend Deployment (Fly.io / AWS ECS / Railway):**
Due to stateful WebSocket necessities tied to Redis, Serverless environments are inadequate for our API servers. We specifically deploy containerized (Docker) Express.js Node instances. Ensure the deployment platform supports **sticky sessions** if working behind load balancers with `socket.io`.

**Database (Supabase / AWS RDS):**
Our instances require Postgres `v14+` utilizing connection pooling (PgBouncer mode: *Transaction*). Setting the mode to *Session* will overload memory aggressively, crashing the Next.js backend invocations.

---

## 2. Docker Setup

For internal staging or container deployments, build images via Dockerfile:

### Backend Dockerfile Example
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 3. GitHub Actions Continuous Integration

We enforce comprehensive testing before any deployment pipeline merges to the `main` ecosystem.

```yaml
name: Node CI

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js 18.x
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
        
    - name: Backend Verify
      run: |
        cd Backend
        npm ci
        npx prisma generate
        npm run type-check
        npm run lint
        npm test
        
    - name: Frontend Verify
      run: |
        cd Frontend
        npm ci
        npm run type-check
        npm run lint
        npm run build
```

---

## 4. Zero Downtime Migration Flows

1. Push schema modifications strictly using `npx prisma migrate deploy` within your CI pipeline container prior to app initialization.
2. The Database must be migrated before Vercel swaps active aliases for the new Frontend iteration.
3. If structural breaking API modifications occur, they must be versioned (i.e. `/api/v2/battles`) to allow legacy clients to empty out gracefully.

---

## 5. Pre-Deployment Configuration Walkthrough

1. Assign `CORS_ORIGIN` inside API container `.env` explicitly mapping to `https://yourapp.domain.com`.
2. Connect Redis cache server, inject URI to `REDIS_URL`.
3. Validate Cloudinary configuration to prevent User Avatar loading breaks.
4. Scale API containers horizontally to `>=3` to effectively balance Socket traffic load.
