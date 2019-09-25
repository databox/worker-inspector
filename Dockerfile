FROM alpine:latest

RUN apk add --update nodejs && apk add npm

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY config ./config
COPY index.ts .
COPY script.sh .
RUN chmod +x script.sh

RUN npm install && npx tsc

RUN touch script.log
RUN chmod 777 script.log

RUN echo '*  *  *  *  *    /usr/src/app/script.sh' > /etc/crontabs/root

CMD crond -l 2 -f