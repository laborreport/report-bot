FROM node:10
WORKDIR /usr/app
COPY ./src/ ./src/
COPY package*.json ./
RUN npm install
COPY ./webpack.config.js ./
COPY ./tsconfig.json ./
COPY ./.babelrc ./
COPY ./.env ./
RUN npm run build
CMD ["npm", "run", "pm2"]