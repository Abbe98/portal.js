# Builds and runs the app server for testing against, e.g. in e2e test runs.
#
# Assumes the provision of pre-installed Node modules at /app/node_modules/,
# e.g. via a mounted volume.

FROM node:12-alpine

ENV NODE_ENV=development
ENV PORT=8080
ENV HOST=0.0.0.0
ENV CHROMEDRIVER_SKIP_DOWNLOAD=true
ENV GECKODRIVER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

EXPOSE ${PORT}

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY docker/stack/app/docker-entrypoint.sh ./

COPY . .

ENTRYPOINT ["/app/docker-entrypoint.sh"]
