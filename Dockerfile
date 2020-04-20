FROM node:10.17.0-alpine as builder

WORKDIR /usr/src/app

RUN apk --update --no-cache add -t build-dependencies build-base python git openssh-client && \
  mkdir -p /root/.ssh && \
  ssh-keyscan github.ibm.com > /root/.ssh/known_hosts

COPY tmp/deploy_id_rsa /root/.ssh/id_rsa

COPY package*.json ./
RUN npm config set unsafe-perm true && npm ci

COPY . ./
RUN npm run compile && npm prune --production

RUN rm -rf /root/.ssh/id_rsa

FROM node:10.17.0-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ .

CMD ["npm", "start"]