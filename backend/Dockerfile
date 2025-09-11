FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN apk add --no-cache bash

# Make wait-for-it.sh executable
RUN chmod +x wait-for-it.sh

EXPOSE 5000

# Use wait-for-it.sh to delay start until DB is ready
CMD ["./wait-for-it.sh", "postgres:5432", "--", "node", "server.js"]