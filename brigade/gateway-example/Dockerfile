FROM node:9-alpine

RUN mkdir /app
WORKDIR /app
COPY *.js /app/
COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install 
#RUN yarn add brigadier

CMD ["yarn", "start"]
