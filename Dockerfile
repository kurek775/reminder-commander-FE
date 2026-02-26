### Stage 1: build ###
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration=production


### Stage 2: output ###
# Minimal image that copies the build output to a shared volume.
# docker-compose.prod.yml mounts a named volume at /output;
# Caddy reads the same volume to serve the SPA.
FROM alpine:3.21 AS output

COPY --from=build /app/dist/reminder-commander-fe/browser /app/dist

CMD ["sh", "-c", "rm -rf /output/* && cp -r /app/dist/. /output/"]
