# ==============================================================================
# Production Dockerfile with Unified Node.js API + Static Frontend
# Connects directly to alo-postgres on Coolify Docker Network
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime Stage: Unified Node + Express API + Static Server
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 80

CMD ["node", "server/index.js"]
