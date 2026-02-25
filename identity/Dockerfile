# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY identity/package*.json ./

# Install dependencies (include Prisma CLI for migrate/generate in container startup)
RUN npm ci

# Copy Prisma schema
COPY identity/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY identity/. .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
