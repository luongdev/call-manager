FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine

WORKDIR /opt/callmanager

COPY --from=builder /app/dist /opt/callmanager/dist
COPY --from=builder /app/node_modules /opt/callmanager/node_modules

ENV DATABASE_TYPE "postgres"
ENV DATABASE_HOST "localhost"
ENV DATABASE_PORT "5432"
ENV DATABASE_NAME "callmanager"
ENV DATABASE_USERNAME "postgres"
ENV DATABASE_PASSWORD ""

ENV LOG_LEVEL "info"

ENV FS_CLIENT_ENABLED "false"
ENV FS_HOST "localhost"
ENV FS_PORT "8021"
ENV FS_PASSWORD='ClueCon'
ENV FS_SERVER_ENABLED "true"

EXPOSE 65022

CMD ["node", "/opt/callmanager/dist/main.js"]
