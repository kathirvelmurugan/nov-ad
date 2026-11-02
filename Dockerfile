# ==============================================================================
# Multi-Stage Production Dockerfile for ALO DOCTOR (nov-ad)
# Stage 1: Build React/Vite/Tailwind Application
# Stage 2: Serve with Ultra-Lightweight Nginx Alpine (< 25MB)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
