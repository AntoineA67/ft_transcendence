FROM debian:latest as prod

RUN apt-get update && apt-get install -y nginx
COPY ./default /etc/nginx/sites-available/default
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

FROM debian:latest as dev

RUN apt-get update && apt-get install -y nginx
COPY ./default /etc/nginx/sites-available/default
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]