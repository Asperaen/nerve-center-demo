# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install vite (needed for preview server)
# Install all dependencies to ensure vite and its dependencies are available
RUN pnpm install --frozen-lockfile

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy vite config (needed for preview server configuration)
COPY vite.config.ts ./

# Expose port 4173 (Vite preview default port)
EXPOSE 4173

# Start Vite preview server
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]

