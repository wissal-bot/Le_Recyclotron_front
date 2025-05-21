# Stage 1: Build the Angular app
FROM node:22 AS builder

WORKDIR /app

# Install dependencies and build the Angular app
COPY tsconfig*.json package*.json
COPY Caddyfile Dockerfile angular.json ./
COPY ./src ./src
COPY ./public ./public

RUN npm install
RUN npm run build

# Stage 2: Serve the app with Caddy
FROM caddy:2.9.1-alpine AS server

# Copy the Angular build output from the builder stage into Caddy's serving directory
COPY --from=builder /app/dist/le-recyclotron-front/browser /srv

# Copy Caddyfile to configure Caddy
COPY ./Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
