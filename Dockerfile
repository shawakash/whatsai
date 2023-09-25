FROM node:20.6.1-alpine

# RUN npm install -g yarn
# RUN npm install -g pm2
# RUN npm install -g ts-node


WORKDIR /usr/src/app
COPY packages*.json ./
COPY tsconfig.json ./
COPY packages/database/prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN yarn install

RUN yarn build

CMD ["yarn", "dev"]

EXPOSE 3000