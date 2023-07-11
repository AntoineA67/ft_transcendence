FROM nginx:latest   
RUN apt-get update && apt-get install -y nginx openssl
COPY conf/default /etc/nginx/sites-available/default
RUN openssl req -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=FR/ST=ARA/L=Lyon/O=Dis/CN=localhost" \
    -keyout /etc/ssl/localhost.key  -out /etc/ssl/localhost.cert

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]