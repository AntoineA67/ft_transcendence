# Base image
FROM node:18-alpine as base

WORKDIR /app
# COPY package*.json ./
# COPY . .

FROM base as DEV
ENTRYPOINT ["sh", "-c", "npm i && npm start"]


FROM base as PROD
ENTRYPOINT ["sh", "-c", "npm ci && npm build"]
CMD [ "node", "dist/main.js" ]
