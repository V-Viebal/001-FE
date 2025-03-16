# Stage 1: Build Stage (Node.js)
FROM node:22 AS build-web
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=8192
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY . .

# Install dependencies in production mode for faster build
RUN npm i
RUN npm i -g nx@18.3.2

# Build the application (SSR and Prerender)
RUN nx run angular-core:build
RUN nx run build-prod && nx run prerender-prod

# Stage 2: Production Stage for Unified Node.js and Nginx Container
FROM alpine:3.18

# Install necessary runtime dependencies
RUN apk add --no-cache pcre zlib openssl libstdc++ nginx nodejs npm

# Set up directories and permissions in a single layer to save space
RUN mkdir -p /var/lib/nginx /usr/share/nginx/html /var/log/nginx && \
    chown -R nginx:nginx /var/lib/nginx /var/log/nginx

# Copy built application files from the build stage
COPY --from=build-web /app/dist/production/browser /usr/share/nginx/html
COPY --from=build-web /app/dist/production/server /app/dist/production/server
COPY --from=build-web /app/package.json /app/

# Set the working directory for Node.js
WORKDIR /app


# Install production dependencies in a single layer for optimization
RUN npm i --only=production && npm cache clean --force

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expose necessary ports
EXPOSE 80

# Run both Nginx and Node.js server
CMD ["/bin/sh", "-c", "nginx && node /app/dist/production/server/main.js"]
