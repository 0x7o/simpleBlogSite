FROM node:alpine

WORKDIR /app/frontend
COPY ./package*.json ./

RUN npm install
COPY ./ ./
RUN npm run build

EXPOSE 4000
CMD npm run start