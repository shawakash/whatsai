FROM node:20.6.1-alpine

# RUN npm install -g yarn
# RUN npm install -g pm2
# RUN npm install -g ts-node


WORKDIR /usr/src/app
COPY packages*.json ./
COPY tsconfig.json ./
COPY packages/database/prisma/schema.prisma ./prisma/

COPY . .
RUN yarn install
RUN npx prisma generate

RUN yarn build

CMD ["yarn", "dev"]

EXPOSE 3000