FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
RUN npm ci

COPY apps/web ./apps/web
COPY packages/database ./packages/database
COPY tsconfig.base.json ./
COPY turbo.json ./

RUN npm run build --workspace=apps/web

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/apps/web/.next ./.next
COPY --from=base /app/apps/web/public ./public
COPY --from=base /app/apps/web/package.json ./
COPY --from=base /app/apps/web/next.config.js ./
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
