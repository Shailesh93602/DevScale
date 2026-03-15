# Write a Multi-Stage Dockerfile

You are tasked with creating a production-ready multi-stage Dockerfile for a Node.js TypeScript application. Multi-stage builds allow you to use multiple `FROM` statements in your Dockerfile, each starting a new build stage. You can selectively copy artifacts from one stage to another, leaving behind everything you don't need in the final image.

## Problem

Given a configuration object describing an application, generate a complete multi-stage Dockerfile as a string. The Dockerfile must:

1. **Build Stage**: Install all dependencies (including devDependencies), compile TypeScript, and produce production-ready artifacts
2. **Production Stage**: Use a slim base image, copy only production dependencies and compiled code, and configure the container to run the application

---

## Requirements

- Use `node:20-alpine` as the base image for both stages (unless overridden by config)
- The build stage should be named `builder`
- Install dependencies using `npm ci` (not `npm install`) for reproducible builds
- Copy only `package.json` and `package-lock.json` first (leverage Docker layer caching)
- Run the build command to compile TypeScript
- In the production stage, copy only `node_modules` (production) and compiled output from the builder
- Set the `NODE_ENV` environment variable to `production`
- Expose the specified port
- Use a non-root user for security
- Set the correct `CMD` to start the application

---

## Examples

**Example 1:**
```text
Input: {
  baseImage: "node:20-alpine",
  buildCmd: "npm run build",
  startCmd: "node dist/index.js",
  port: 3000
}

Output:
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Example 2:**
```text
Input: {
  baseImage: "node:18-slim",
  buildCmd: "npm run compile",
  startCmd: "node build/server.js",
  port: 8080
}

Output: (similar structure with node:18-slim base, compile command, build/ directory, port 8080)
```

---

## Constraints

- Must use at least 2 stages (build and production)
- Final image must not contain devDependencies or source TypeScript files
- Must use specific base image tags (never `latest`)
- Build artifacts must be correctly copied between stages
- Must include `WORKDIR`, `ENV`, `EXPOSE`, `USER`, and `CMD` directives
- The Dockerfile must be valid and buildable

---

## Follow-up

Can you add a third stage for running tests before the production build?
