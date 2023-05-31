FROM node:latest as build
WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT ["npm", "start"]
