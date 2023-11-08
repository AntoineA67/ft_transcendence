FROM debian:latest

RUN apt-get update && apt-get install -y nginx

COPY ./default /etc/nginx/sites-available/default

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]