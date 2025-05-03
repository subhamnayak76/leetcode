FROM node:18-alpine

WORKDIR /app


COPY package*.json ./

RUN npm install -g typescript && npm install

COPY . .

RUN npx prisma generate


RUN npm run build


ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV DATABASE_URL=postgresql://postgres:apple@postgres:5432/postgres


CMD ["node", "dist/worker.js"]