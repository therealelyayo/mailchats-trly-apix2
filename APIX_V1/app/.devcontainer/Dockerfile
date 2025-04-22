FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Install Python
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends python3 python3-pip python3-venv

# Set working directory
WORKDIR /workspaces/mailchats-trly-apix2

# Copy package files
COPY package*.json ./

# Switch to node user
USER node

# Install dependencies
RUN npm install