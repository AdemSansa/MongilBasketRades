# Multi-stage build: compile the Angular app with Node, serve the static
# build with nginx (also reverse-proxies /api to the backend container).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/admin/browser /usr/share/nginx/html
EXPOSE 80
