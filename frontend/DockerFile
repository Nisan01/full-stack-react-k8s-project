
#stage 1 react build 

FROM node as build-stage

WORKDIR /myapp

COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build   


#stage 2 copy the build static assets to the server nginx

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /myapp/build .

ENTRYPOINT [ "nginx","-g","daemon off;" ]

