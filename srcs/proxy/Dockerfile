FROM debian:latest as dev

RUN apt-get update && apt-get install -y nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]