FROM node:10
WORKDIR /usr/app
COPY ./src/ /usr/app/src/
COPY package*.json ./
RUN npm install
COPY ./webpack.config.js /usr/app
COPY ./tsconfig.json /usr/app
COPY ./.babelrc /usr/app

RUN npm run build
CMD ["npm", "run", "pm2"]