# Base image
FROM node:lts as base

WORKDIR /app

RUN apt-get update -y
RUN apt-get upgrade -y

FROM base as dev

ENTRYPOINT ["sh", "-c", "\
    npm i && \
    cd src/prisma && \
    npx prisma db push --accept-data-loss --force-reset && \
    npx prisma generate && \
    npm run start:dev"]

FROM base as prod

ENTRYPOINT ["sh", "-c", "npm ci && \
    cd src/prisma && \
    npx prisma db push --accept-data-loss --force-reset && \
    npx prisma generate && \
    npm run build && \
    cd ../.. && node dist/main.js"]

