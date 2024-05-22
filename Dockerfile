FROM node:20

WORKDIR /website

COPY . .

RUN npm ci

CMD ["npm", "run", "start"]
