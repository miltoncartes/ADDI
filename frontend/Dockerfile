# syntax=docker/dockerfile:1
# Multiplataforma: node:22-alpine se publica para linux/amd64 y linux/arm64,
# así la misma imagen corre igual en Windows/Mac/Linux con Docker Desktop o Engine.

FROM node:22-alpine AS deps
WORKDIR /app
# Fija npm a la misma versión mayor usada para generar package-lock.json (lockfileVersion 3):
# una versión de npm distinta puede resolver el árbol de dependencias de forma distinta y
# hacer fallar `npm ci` con "Missing: ... from lock file".
RUN npm install -g npm@11
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* se incrusta en el bundle del navegador en tiempo de build:
# apunta a la URL donde el NAVEGADOR del usuario podrá alcanzar al backend.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
