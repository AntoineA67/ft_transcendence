# Base image
FROM node:18-alpine as base

ARG POSTGRES_HOST=;
ARG POSTGRES_PORT=;
ARG POSTGRES_USERNAME=;
ARG POSTGRES_PASSWORD=;
ARG POSTGRES_NAME=;

WORKDIR /app

FROM base as DEV
ENTRYPOINT ["sh", "-c", "npm i && npm run start:dev"]


FROM base as PROD
ENTRYPOINT ["sh", "-c", "npm ci && npm build"]
CMD [ "node", "dist/main.js" ]
