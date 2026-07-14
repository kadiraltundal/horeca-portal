FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
RUN npm ci

# Copy source
COPY apps/backend ./apps/backend
COPY packages/database ./packages/database
COPY tsconfig.base.json ./
COPY turbo.json ./

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build
RUN npm run build --workspace=apps/backend

# Production
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/package.json ./apps/backend/
COPY --from=base /app/packages/database ./packages/database

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
