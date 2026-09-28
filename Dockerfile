# Use official lightweight Node.js 20 LTS Alpine image
FROM node:20-alpine

# Set deployment environment
ENV NODE_ENV=production
ENV PORT=3000

# Create and define the application directory
WORKDIR /usr/src/app

# Copy package dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set non-root user for security
USER node

# Expose port (default 3000, dynamically overridden by process.env.PORT in cloud hosts)
EXPOSE 3000

# Container healthcheck using Node 20 native fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["node", "app.js"]
