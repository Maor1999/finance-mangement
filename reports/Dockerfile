# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY reports/package*.json ./

# Install dependencies (include Prisma CLI for migrate/generate in container startup)
RUN npm ci

# Copy Prisma schema
COPY reports/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code + shared utilities used by reports
COPY reports/. .
COPY shared /shared

# Expose port (assuming 5001, adjust if different)
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
