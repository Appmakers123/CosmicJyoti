# CosmicJyoti Backend API - No Vite/Rollup
# Build context: repo root. Copy only server folder.
# Use bookworm-slim (not alpine) and linux/amd64 to avoid Cloud Run
# "Manifest.Layers vs ConfigFile.RootFS.DiffIDs" / RiptideContainer errors.
FROM --platform=linux/amd64 node:20-bookworm-slim

WORKDIR /app

# Copy package files first for layer cache
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy app (must be after package install so layer is valid)
COPY server/ ./

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "index.js"]
