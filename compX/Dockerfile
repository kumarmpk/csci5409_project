# inspired by https://medium.com/bb-tutorials-and-thoughts/dockerizing-angular-app-with-nodejs-backend-85e9d332335d

FROM node:10 AS angular_ui
WORKDIR /usr/src/app
COPY frontend/ ./companyX
RUN cd companyX && npm install @angular/cli && npm install && npm run build

FROM node:10
WORKDIR /root/
COPY --from=angular_ui /usr/src/app/companyX/dist ./companyX/dist

COPY /Backend/package*.json ./
RUN npm install
COPY /Backend/. .
CMD node server.js
EXPOSE 3000