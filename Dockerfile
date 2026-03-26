FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source and build frontend
COPY . .
RUN npm run build

EXPOSE 3001

ENV NODE_ENV=production
CMD ["npm", "start"]
