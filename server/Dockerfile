# Slim keeps the image ~5x smaller than node:22, which shortens Cloud Run cold
# starts and stays inside Artifact Registry's free storage. bcrypt ships a
# prebuilt linux-x64 glibc binary, so no compiler is needed.
FROM node:22-slim

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

USER node

EXPOSE 8080

# Run node directly so SIGTERM from Cloud Run reaches the shutdown handler.
CMD ["node", "index.js"]
