# sources:
# https://docs.docker.com/develop/develop-images/multistage-build/
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/


FROM node:24 AS react

WORKDIR /squeng/fixadat

COPY fegui/.env ./
# COPY fegui/.npmrc ./
COPY fegui/package*.json ./
# https://docs.npmjs.com/cli/v10/commands/npm-ci
RUN npm ci

COPY fegui/index.html ./
COPY fegui/public ./public
COPY fegui/src ./src
COPY fegui/tsconfig.json ./
COPY fegui/tsconfig.node.json ./
COPY fegui/vite.config.ts ./
RUN npm run build


FROM sbtscala/scala-sbt:eclipse-temurin-25.0.3_9_1.12.11_3.3.7 AS play

WORKDIR /squeng/fixadat

COPY beapi/app ./app
COPY beapi/conf ./conf
COPY beapi/project ./project
COPY beapi/public ./public
COPY beapi/hexagon ./hexagon
COPY beapi/build.sbt ./
COPY --from=react /squeng/fixadat/build ./public/build
RUN sbt stage


FROM eclipse-temurin:25-jre

WORKDIR /squeng/fixadat

COPY --from=play /squeng/fixadat/target/universal/stage ./target/universal/stage

RUN groupadd -r gruppe && useradd --no-log-init -r -g gruppe benutzer && chown -R benutzer:gruppe /squeng
USER benutzer

EXPOSE 8080
CMD ["target/universal/stage/bin/fixadat", "-Dpidfile.path=play.pid", "-Dhttp.port=8080"]
