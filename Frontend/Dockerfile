# =========================
# Stage 1: build
# =========================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# Usa `npm ci` se existir package-lock.json (build reproduzível e mais rápido),
# senão cai pra `npm install` que gera o lock e instala.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_WS_URL=http://localhost:8080/ws
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY . .
RUN npm run build

# =========================
# Stage 2: nginx
# =========================
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost/healthz || exit 1
