# -- Build stage --
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG REACT_APP_API_URL=http://localhost:8000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# -- Production stage --
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# The nginx entrypoint renders /etc/nginx/templates/*.template into conf.d at
# start-up. The filter restricts envsubst to API_UPSTREAM so nginx's own
# runtime variables survive untouched.
ENV API_UPSTREAM=api:80 \
    NGINX_ENVSUBST_FILTER=API_UPSTREAM

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
