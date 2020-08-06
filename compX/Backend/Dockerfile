FROM node:10
WORKDIR /src/taskCorp
COPY package*.json ./
RUN npm install
COPY . .
CMD npm start
EXPOSE 4000