# Long-lived EduScale API: REST + Socket.io + in-process battle timers + Bull.
# Vercel keeps serving the REST API from api/index.ts; this image is for the
# realtime host. Owner steps: docs/REALTIME_HOSTING.md.

FROM node:20-bookworm-slim AS build
WORKDIR /app
# Prisma's query engine links against OpenSSL.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
COPY resources ./resources
# vercel-build.sh only migrates when VERCEL_ENV=production, so this never
# touches a database: migrations stay owned by the Vercel production deploy.
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# dist/controllers/resourceController.js imports ../../resources/*.json.
COPY --from=build /app/resources ./resources
USER node
# PORT comes from the platform (Render/Koyeb/Cloud Run); 5000 is the local default.
EXPOSE 5000
# Running dist/main.js directly is what calls App.start(): listen, Socket.io,
# battle timers and the Bull retention job.
CMD ["node", "dist/main.js"]
