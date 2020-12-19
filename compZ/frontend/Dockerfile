FROM node:12.16

WORKDIR /app

COPY . /app

RUN yarn global add serve

CMD serve -s build

EXPOSE 5000