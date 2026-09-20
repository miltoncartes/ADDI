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
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g npm@11
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
