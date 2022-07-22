FROM node:lts-alpine3.16@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b as builder

RUN mkdir -p /usr/app/node_modules && chown -R node:node  /usr/app

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn config set unsafe-perm true

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node prisma ./prisma

USER node

COPY --chown=node:node . .

RUN yarn install


RUN yarn build

#----- Staging
FROM node:lts-alpine3.16@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b as stager

WORKDIR /usr/app

COPY package.json yarn.lock ./

COPY --chown=node:node prisma ./prisma

RUN yarn config set unsafe-perm true



RUN apk add --no-cache --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python3 && \
  yarn global add node-gyp

ENV NODE_ENV=production

RUN yarn install --prod && \
  apk del native-deps


#----- Production
FROM node:lts-alpine3.16@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b as prod
RUN mkdir -p /usr/app/node_modules && chown -R node:node  /usr/app

WORKDIR /usr/app

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV PORT 80
ENV NODE_ENV=development

COPY --chown=node:node --from=stager /usr/app/package.json /usr/app/yarn.lock ./
COPY --chown=node:node --from=builder /usr/app/dist ./dist
COPY --chown=node:node --from=stager /usr/app/node_modules ./node_modules
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node ecosystem.config.js ./
COPY --chown=node:node scripts ./scripts

RUN yarn global add pm2

USER node

EXPOSE 80


CMD ["yarn", "start"]
