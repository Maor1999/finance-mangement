# Dependency stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY finance/package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save && npm cache clean --force
COPY finance/prisma ./prisma
RUN npx prisma generate

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY finance/. .
COPY shared /shared
RUN ln -s /app/node_modules /shared/node_modules

EXPOSE 4001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "server.js"]
