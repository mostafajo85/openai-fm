# Lightweight Node.js 20 Alpine image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build Next.js application with explicit error handling
RUN npm run build || (echo "━━━━ BUILD FAILED — SEE ERROR ABOVE ━━━━" && exit 1)

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
