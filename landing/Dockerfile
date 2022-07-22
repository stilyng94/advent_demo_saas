FROM node:lts-alpine3.16@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b as builder

WORKDIR /usr/app

COPY package*.json ./

RUN yarn config set unsafe-perm true

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY . .

RUN yarn install
RUN yarn build

#----- Production
FROM nginx:stable-alpine as production-stage

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]