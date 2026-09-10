FROM node:22

ENV PORT=8080

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

EXPOSE 8080

CMD ["npm", "start"]
