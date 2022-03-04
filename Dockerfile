FROM node:16-bullseye

ENV DATA=""

RUN mkdir /workdir
RUN mkdir /src

ADD index.js /src/index.js
ADD package.json /src/package.json
ADD package-lock.json /src/package-lock.json

RUN set -eux \
    && cd /src \
    && npm ci

WORKDIR /workdir

VOLUME /workdir

ENTRYPOINT ["node", "/src/index.js"]
