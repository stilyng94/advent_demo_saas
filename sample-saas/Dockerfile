FROM node:lts-alpine3.16@sha256:9da65f99264be2a78682095c4789b3d8cab12e0012def7d937d7125ed6e7695c as builder

RUN mkdir -p /usr/app/node_modules && chown -R node:node  /usr/app

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn config set unsafe-perm true

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node prisma ./prisma

USER node

COPY --chown=node:node . .

RUN yarn install

# Generate Prisma Types
RUN yarn generate:admin
RUN yarn generate:tenant


RUN yarn build

#----- Staging
FROM node:lts-alpine3.16@sha256:9da65f99264be2a78682095c4789b3d8cab12e0012def7d937d7125ed6e7695c as stager

WORKDIR /usr/app

COPY package.json yarn.lock ./

COPY --chown=node:node prisma ./prisma

RUN yarn config set unsafe-perm true



RUN apk add --no-cache --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python3 && \
  yarn global add node-gyp

ENV NODE_ENV=production

RUN yarn install --prod && \
  yarn generate:admin && \
  yarn generate:tenant && \
  apk del native-deps


#----- Production
FROM node:lts-alpine3.16@sha256:9da65f99264be2a78682095c4789b3d8cab12e0012def7d937d7125ed6e7695c as prod
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

ENTRYPOINT [ "./scripts/entrypoint.sh" ]

CMD ["yarn", "start"]
