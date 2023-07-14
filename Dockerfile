FROM amd64/node:latest

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "start"]
