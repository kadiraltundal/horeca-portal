FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
RUN npm ci

COPY apps/admin ./apps/admin
COPY tsconfig.base.json ./
COPY turbo.json ./

RUN npm run build --workspace=apps/admin

FROM nginx:alpine AS production

COPY --from=base /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
