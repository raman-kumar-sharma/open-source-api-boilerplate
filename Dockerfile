FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

FROM base AS dependencies

RUN npm ci --only=production && npm cache clean --force

FROM base AS build

RUN npm ci

COPY . .

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./

RUN mkdir -p logs && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/v1/health/ready',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
