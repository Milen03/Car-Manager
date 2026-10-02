# Slim keeps the image ~5x smaller than node:22. bcrypt ships a prebuilt
# linux-x64 glibc binary, so no compiler is needed. Railway sets PORT.
FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

USER node

# Run node directly so SIGTERM from Railway reaches the shutdown handler.
CMD ["node", "index.js"]
