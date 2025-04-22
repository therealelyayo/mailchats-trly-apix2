# Base image with Node.js and Python
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install Python and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip3 install --no-cache-dir beautifulsoup4 requests python-dotenv

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]