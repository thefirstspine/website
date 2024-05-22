FROM node:18

WORKDIR /website

COPY . .

RUN npm ci

CMD ["npm", "run", "start"]
