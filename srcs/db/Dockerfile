# Base image
FROM postgres:latest

ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_USERNAME
ARG POSTGRES_PASSWORD
ARG POSTGRES_NAME

# # Installer le client PostgreSQL pour utiliser pg_isready
# RUN apt-get update && apt-get install -y postgresql-client
# RUN echo "DROP DATABASE IF EXISTS ${POSTGRES_NAME};" >> /docker-entrypoint-initdb.d/structure.sql
RUN echo "CREATE DATABASE ${POSTGRES_NAME};" >> /docker-entrypoint-initdb.d/structure.sql

# COPY structure.sql .
# RUN cat structure.sql >> /docker-entrypoint-initdb.d/structure.sql
# RUN chown -R postgres:postgres /var/lib/postgresql/data
# RUN rm structure.sql

# # Démarrer le service PostgreSQL et exécuter le fichier SQL pour l'initialisation
# USER postgres
# CMD ["postgres"]
