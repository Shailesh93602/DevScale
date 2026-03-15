# Editorial — Write a Multi-Stage Dockerfile

## Problem Summary

Create a multi-stage Dockerfile generator that produces optimized, production-ready Docker images. The key challenge is understanding Docker build stages, layer caching, and security best practices.

---

## Approach 1 — Basic Two-Stage Build

The fundamental approach uses two stages: one for building and one for running.

```typescript
function generateDockerfile(config: {
  baseImage: string;
  buildCmd: string;
  startCmd: string;
  port: number;
}): string {
  const { baseImage, buildCmd, startCmd, port } = config;
  const cmdParts = startCmd.split(" ");
  const cmdArray = cmdParts.map(p => `"${p}"`).join(", ");
  const distDir = startCmd.includes("/")
    ? startCmd.split(" ").pop()!.split("/")[0]
    : "dist";

  return `# Build stage
FROM ${baseImage} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ${buildCmd}

# Production stage
FROM ${baseImage}
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/${distDir} ./${distDir}
USER node
EXPOSE ${port}
CMD [${cmdArray}]`;
}
```

**Key Concepts:**
- **Layer Caching**: Copy `package*.json` first so dependency installation is cached when only source code changes
- **`npm ci`**: Uses lockfile for deterministic installs, faster than `npm install`
- **`--only=production`**: Excludes devDependencies in the final image
- **`npm cache clean --force`**: Reduces final image size

---

## Approach 2 — Enhanced with .dockerignore and Security

```typescript
function generateDockerfile(config: {
  baseImage: string;
  buildCmd: string;
  startCmd: string;
  port: number;
}): string {
  const { baseImage, buildCmd, startCmd, port } = config;
  const cmdParts = startCmd.split(" ");
  const cmdArray = cmdParts.map(p => `"${p}"`).join(", ");
  const distDir = startCmd.includes("/")
    ? startCmd.split(" ").pop()!.split("/")[0]
    : "dist";

  return `# Build stage
FROM ${baseImage} AS builder
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig*.json ./
COPY src/ ./src/
RUN ${buildCmd}

# Prune dev dependencies
RUN npm prune --production

# Production stage
FROM ${baseImage}
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && \\
    adduser -S appuser -u 1001 -G appgroup

ENV NODE_ENV=production

# Copy production artifacts
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/${distDir} ./${distDir}
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

CMD [${cmdArray}]`;
}
```

**Improvements:**
- Selective COPY (only tsconfig and src/) instead of COPY . .
- `npm prune --production` in builder removes devDeps before copying
- Custom non-root user with specific UID/GID
- HEALTHCHECK directive for container orchestration
- `--chown` flag sets proper file ownership

---

## Best Practices

1. **Use specific image tags**: `node:20-alpine` not `node:latest`
2. **Leverage layer caching**: Copy dependency files before source code
3. **Minimize layers**: Combine related RUN commands with `&&`
4. **Use Alpine images**: Significantly smaller than Debian-based images
5. **Run as non-root**: Security requirement for production containers
6. **Add HEALTHCHECK**: Enables orchestrators to monitor container health
7. **Clean up caches**: `npm cache clean --force` reduces image size
8. **Use .dockerignore**: Prevent unnecessary files from entering build context

---

## Common Mistakes

- Using `npm install` instead of `npm ci` (non-deterministic builds)
- Copying `node_modules` from host into container
- Running as root in production
- Using `latest` tag (breaks reproducibility)
- Not leveraging layer caching (copying everything before installing deps)
