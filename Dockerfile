FROM node:20

WORKDIR /website

COPY . .

RUN npm i

CMD ["npm", "run", "start"]
