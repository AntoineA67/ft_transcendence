# Base image
FROM node:18-alpine as base

ARG POSTGRES_HOST=;
ARG POSTGRES_PORT=;
ARG POSTGRES_USERNAME=;
ARG POSTGRES_PASSWORD=;
ARG POSTGRES_NAME=;
ARG JWT_SECRET=;
ARG DATABASE_URL=;

WORKDIR /app
RUN apk --no-cache add curl

FROM base as DEV
ENTRYPOINT ["sh", "-c", "npm i && cd ./src && npx prisma generate && npx prisma migrate dev && npm run start:dev"]

FROM base as PROD
ENTRYPOINT ["sh", "-c", "npm ci && npm build"]
CMD [ "node", "dist/main.js" ]
