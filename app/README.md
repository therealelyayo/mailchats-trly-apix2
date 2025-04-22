# MailChats Trly APIX V1

A sophisticated web application for intelligent email management, designed to enhance user productivity through innovative interface design and multi-cloud deployment capabilities.

## Quick Start

```bash
# Install dependencies
./install.sh

# Start the application
cd app && npm run start
```

## Docker Deployment

Several options are available for containerized deployment:

### Option 1: Using Docker Compose

```bash
# Run without database (in-memory storage)
docker-compose up -d

# Run with PostgreSQL database
docker-compose --profile with-db up -d
```

### Option 2: Using Docker Hub

```bash
# Build and push to Docker Hub
./docker-hub-deploy.sh yourusername 1.0.0

# Pull and run from Docker Hub
docker pull yourusername/mailchats-apix-v1:1.0.0
docker run -p 3000:3000 -e SESSION_SECRET=your_secret yourusername/mailchats-apix-v1:1.0.0
```

### Option 3: Building Custom Image

```bash
# Build with options
./build-docker-image.sh --platform linux/amd64,linux/arm64 --push --registry yourusername
```

For comprehensive Docker documentation, see [README-DOCKER.md](README-DOCKER.md) or the quick guide [DOCKER-DEPLOYMENT-GUIDE.md](DOCKER-DEPLOYMENT-GUIDE.md).

## Packages

- `mailchats_trly_apix_v1_1.0.0.zip` - Main application package (283K)
- `mailchats_trly_apix_v1_docker_files.zip` - Docker deployment files (11K)
- `mailchats_trly_apix_v1_complete.zip` - Complete package with app and Docker files (295K)

## Features

- React frontend with TypeScript and Tailwind CSS/Shadcn UI
- Node.js backend with Express and TypeScript
- Python email sending scripts with advanced personalization
- PostgreSQL database integration with Drizzle ORM
- Multi-cloud deployment support (Docker, native, cloud)
- WebSocket real-time communication
- Smart template engine with AI assistance
- DeepSeek AI integration for subject line generation
- Responsive design for all device sizes

## Directory Structure

- `app/` - Main application code (frontend and backend)
- `attached_assets/` - Email utilities and Python scripts
- `docker-files/` - Docker configuration and deployment scripts

## License

Proprietary. All rights reserved.
