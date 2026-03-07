# CosmicJyoti Backend API - No Vite/Rollup
# Build context: repo root. Copy only server folder.
# Use bookworm-slim (not alpine) to avoid Cloud Run "Manifest.Layers vs ConfigFile.RootFS.DiffIDs" image errors.
FROM --platform=linux/amd64 node:20-bookworm-slim

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ .
EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "index.js"]
