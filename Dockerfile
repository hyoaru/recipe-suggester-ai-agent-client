FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "build"]
