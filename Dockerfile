FROM node:8.18.1

WORKDIR /website

COPY . .

RUN npm ci

CMD ["npm", "run", "start"]
