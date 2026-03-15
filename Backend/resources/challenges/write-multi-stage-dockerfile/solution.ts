// Optimal approach: Multi-stage Dockerfile generator
// Produces a secure, optimized, production-ready Dockerfile

function generateDockerfile(config: {
  baseImage: string;
  buildCmd: string;
  startCmd: string;
  port: number;
}): string {
  const { baseImage, buildCmd, startCmd, port } = config;

  // Parse the start command into CMD array format
  const cmdParts = startCmd.split(" ");
  const cmdArray = cmdParts.map((p) => `"${p}"`).join(", ");

  // Extract the output directory from the start command
  const lastArg = cmdParts[cmdParts.length - 1];
  const distDir = lastArg.includes("/") ? lastArg.split("/")[0] : "dist";

  return `# ---- Build Stage ----
FROM ${baseImage} AS builder
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig*.json ./
COPY src/ ./src/
RUN ${buildCmd}

# Remove dev dependencies
RUN npm prune --production

# ---- Production Stage ----
FROM ${baseImage}
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy production artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/${distDir} ./${distDir}
COPY --from=builder /app/package.json ./

# Use non-root user for security
USER node

# Expose application port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

# Start the application
CMD [${cmdArray}]`;
}

// Test
const result = generateDockerfile({
  baseImage: "node:20-alpine",
  buildCmd: "npm run build",
  startCmd: "node dist/index.js",
  port: 3000,
});
console.log(result);
