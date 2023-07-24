# 1. For build React app
FROM node:lts AS dev

RUN echo "dev"

WORKDIR /app/

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "npm i && npm start"]

FROM node:lts

CMD echo "prod"

WORKDIR /app/

ENV BUILD_PATH="/build/"

COPY . /app/

RUN npm i
RUN npm run build

# # 
# COPY package.json /app/package.json
# COPY package-lock.json /app/package-lock.json

# # Same as npm install
# RUN npm ci

# COPY . /app

# ENV CI=true
# ENV PORT=3000

# CMD [ "npm", "start" ]

# FROM development AS build

# RUN npm run build


# FROM development as dev-envs
# RUN <<EOF \
# apt-get update \
# apt-get install -y --no-install-recommends git \
# EOF

# RUN <<EOF \
# useradd -s /bin/bash -m vscode \
# groupadd docker \
# usermod -aG docker vscode \
# EOF
# # install Docker tools (cli, buildx, compose)
# COPY --from=gloursdocker/docker / /
# CMD [ "npm", "start" ]

# 2. For Nginx setup

FROM nginx:alpine AS prod

# Copy config nginx
#COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /build/

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]

