FROM alpine:latest

# Create app directory
WORKDIR /usr/src/app

# Install languages dependencies
RUN apk update \
    && apk add --no-cache --update nodejs npm \
    && apk add --no-cache openjdk11 \
    && apk add --no-cache apache-ant \
    && apk add --no-cache python3 py3-pip \
    && apk add --no-cache g++ \
    && apk add --no-cache go

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]

