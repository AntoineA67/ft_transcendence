# Base image
FROM postgres:latest

ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_USERNAME
ARG POSTGRES_PASSWORD
ARG POSTGRES_NAME

# Installer le client PostgreSQL pour utiliser pg_isready
RUN apt-get update && apt-get install -y postgresql-client

# Copiez le fichier SQL dans le répertoire d'initialisation de la base de données
COPY structure.sql /docker-entrypoint-initdb.d/

# Assurez-vous que l'utilisateur non privilégié a les droits appropriés sur le répertoire de données de PostgreSQL
RUN chown -R postgres:postgres /var/lib/postgresql/data

# Démarrer le service PostgreSQL et exécuter le fichier SQL pour l'initialisation
USER postgres
CMD ["postgres"]
