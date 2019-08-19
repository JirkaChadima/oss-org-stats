FROM mhart/alpine-node:10
RUN apk update && apk upgrade && apk add --no-cache bash git openssh python make g++

WORKDIR /usr/src/app

COPY update-and-deploy.sh .
COPY config.js .

CMD ["/bin/bash", "/usr/src/app/update-and-deploy.sh"]
