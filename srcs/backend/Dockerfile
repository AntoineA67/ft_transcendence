# Base image
FROM node:lts as base

ARG POSTGRES_HOST=;
ARG POSTGRES_PORT=;
ARG POSTGRES_USERNAME=;
ARG POSTGRES_PASSWORD=;
ARG POSTGRES_NAME=;
ARG JWT_SECRET=;
ARG DATABASE_URL=;

WORKDIR /app

RUN apt-get update -y
RUN apt-get upgrade -y

FROM base as DEV

ENTRYPOINT ["sh", "-c", "npm i && cd src/prisma && npx prisma db push --accept-data-loss --force-reset && npx prisma db seed && npx prisma generate && npm run start:dev"]
# npx prisma studio
FROM base as PROD
# ENTRYPOINT ["sh", "-c", "npm ci && npm build"]
CMD [ "node", "dist/main.js" ]
