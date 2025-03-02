FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27.3-alpine AS runtime
WORKDIR /var/www/public
COPY /nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist .  
EXPOSE 8001
CMD ["nginx", "-g", "daemon off;"]
