FROM amd64/node:latest

ENV PORT=3000
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "start"]
