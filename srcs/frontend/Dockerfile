FROM node:lts AS dev

RUN echo "dev"

WORKDIR /app/
RUN apt-get update && apt-get install -y curl

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "npm i && npm start"]

FROM node:lts

CMD echo "prod"

WORKDIR /app/

ENV BUILD_PATH="/build/"

COPY . /app/

RUN npm i
RUN npm run build
