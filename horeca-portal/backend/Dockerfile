FROM node:20-alpine AS builder
WORKDIR /app
COPY horeca-portal/backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY horeca-portal/backend/ ./
RUN rm -f .env .env.* && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
