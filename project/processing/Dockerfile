FROM node:12

WORKDIR /usr/src/processing

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "server.js" ]
