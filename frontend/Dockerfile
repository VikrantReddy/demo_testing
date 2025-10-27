# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application and validate build output
RUN npm run build && \
    test -f dist/index.html || (echo "Frontend build failed: dist/index.html not found" && exit 1)

# Stage 2: Runtime (using Nginx to serve the static build)
FROM nginx:alpine

# Copy nginx configuration (replaces entire nginx.conf for non-root execution)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a non-root user
RUN addgroup -g 1001 -S nginx && adduser -S nginx -u 1001

# Give nginx user necessary permissions for runtime directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
