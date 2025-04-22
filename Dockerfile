FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    python3-venv \
    curl \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /venv

# Add venv to PATH
ENV PATH="/venv/bin:$PATH"

# Copy package files
COPY app/package*.json ./

# Temporarily remove postinstall script to prevent build during dependency installation
RUN sed -i 's/"postinstall": "npm run build"/"_postinstall": "npm run build"/g' package.json

# Install dependencies
RUN npm ci

# Copy application source
COPY app/ ./
COPY attached_assets/ /app/attached_assets/

# Create symbolic links for Python scripts
RUN ln -sf /app/attached_assets/enhanced_email_parser.py /app/enhanced_email_parser.py \
    && ln -sf /app/attached_assets/send_email.py /app/send_email.py

# Copy client index.html file if it doesn't exist
RUN mkdir -p client && \
    if [ ! -f client/index.html ]; then \
      echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>MailChats APIX</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>' > client/index.html; \
    fi

# Build frontend first with Vite
RUN npx vite build 

# Then build the server without including Vite
RUN node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist \
    && npm prune --production

# Production stage
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /venv \
    && /venv/bin/pip install --no-cache-dir requests \
    && npm install -g pm2

# Add venv to PATH
ENV PATH="/venv/bin:$PATH"

# Create app directory and user
RUN mkdir -p /app /app/uploads /app/temp /app/logs \
    && chown -R node:node /app

WORKDIR /app

# Switch to non-root user
USER node

# Copy package.json and production node_modules
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/server ./server
COPY --from=builder --chown=node:node /app/attached_assets /app/attached_assets
COPY --from=builder --chown=node:node /app/enhanced_email_parser.py /app/enhanced_email_parser.py
COPY --from=builder --chown=node:node /app/send_email.py /app/send_email.py
COPY --from=builder --chown=node:node /app/shared ./shared
COPY --from=builder --chown=node:node /app/theme.json ./theme.json

# Set permissions
RUN chmod +x /app/attached_assets/*.py /app/*.py

# Expose port
EXPOSE 3000

# Create startup script (need to switch back to root for this, then back to node)
USER root
RUN echo '#!/bin/bash\n\
export NODE_ENV=production\n\
export PORT=${PORT:-3000}\n\
\n\
# Check database availability\n\
if [ -n "$DATABASE_URL" ]; then\n\
  echo "Using PostgreSQL database at $PGHOST:$PGPORT"\n\
  # Wait for PostgreSQL to be ready\n\
  echo "Waiting for PostgreSQL..."\n\
  until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do\n\
    echo "PostgreSQL is unavailable - sleeping"\n\
    sleep 2\n\
  done\n\
  echo "PostgreSQL is up - starting server"\n\
else\n\
  echo "WARNING: DATABASE_URL not set. Using in-memory storage."\n\
fi\n\
\n\
echo "Starting MailChats APIX in production mode"\n\
\n\
\n\
# Start the application with PM2\n\
cd /app\n\
exec pm2-runtime start npm -- run start\n\
' > /app/docker-entrypoint.sh \
    && chmod +x /app/docker-entrypoint.sh \
    && chown node:node /app/docker-entrypoint.sh

# Switch back to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]