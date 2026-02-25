# CosmicJyoti Backend API - for Cloud Run (build context: repo root)
# Same as server/Dockerfile; use this when Cloud Run expects /Dockerfile at root.
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ .
EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "index.js"]
