FROM node:12-alpine
WORKDIR /src/taskCorp
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 5000