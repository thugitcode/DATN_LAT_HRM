FROM --platform=linux/amd64 node:22-alpine as build
WORKDIR /app
COPY ./package.json ./yarn.lock /app/
RUN yarn install --frozen-lockfile
ARG CI_ENVIRONMENT_SLUG
ARG NODE_ENV
RUN echo "Configuration: $CI_ENVIRONMENT_SLUG"
RUN echo "Configuration: $NODE_ENV"
COPY . /app/
RUN yarn build

FROM --platform=linux/amd64 nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
