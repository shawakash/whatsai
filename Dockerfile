FROM node:20.6.1-alpine

# RUN npm install -g yarn
# RUN npm install -g pm2
# RUN npm install -g ts-node


WORKDIR /usr/src/app

RUN npm install turbo --global
COPY . .
RUN yarn

RUN turbo run build

CMD ["turbo", "dev"]

EXPOSE 3000