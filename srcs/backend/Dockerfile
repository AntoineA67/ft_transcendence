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

ENTRYPOINT ["sh", "-c", "npm i && cd src/prisma && npx prisma generate && npx prisma db push && npx prisma db seed && npm run start:dev"]
# ENTRYPOINT ["sh", "-c", "npm i && cd src/prisma && npx prisma generate && npx prisma migrate reset --force && npx prisma migrate dev --name initdb && npm run start:dev"]
# npx prisma studio 
FROM base as PROD
ENTRYPOINT ["sh", "-c", "npm ci && npm build"]
CMD [ "node", "dist/main.js" ]
