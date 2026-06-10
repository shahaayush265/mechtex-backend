# Use the official Node.js 20 image as the base
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies needed for typescript)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy the built JS files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port (Render assigns a dynamic port via process.env.PORT, but it's good practice)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
