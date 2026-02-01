# CosmicJyoti Backend API - No Vite/Rollup
# Build context: repo root. Copy only server folder.
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ .
EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "index.js"]
