FROM node:lts AS dev

RUN echo "dev"
WORKDIR /app/
RUN apt-get update && apt-get install -y curl
EXPOSE 8000
RUN rm -rf nodes_modules

ENTRYPOINT ["sh", "-c", "npm i && npm start"]

FROM node:lts AS prod

CMD echo "prod"
WORKDIR /app/
COPY . /app/
RUN npm install serve -g

ENTRYPOINT ["sh", "-c", "npm i && \
    npm run build -- --parallel && \
    serve -s build -l 8000"]
