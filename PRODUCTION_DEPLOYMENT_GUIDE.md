# MailChats Trly APIX V1 Production Deployment Guide

## 1. Package Overview

Three packages are available for deployment:

- **Application Package** (284KB): `mailchats_trly_apix_v1_1.0.0.zip`
- **Docker Files Package** (11KB): `mailchats_trly_apix_v1_docker_files.zip`
- **Complete Package** (308KB): `mailchats_trly_apix_v1_complete.zip`

## 2. Native Deployment

### Prerequisites
- Node.js 18+ or 20+ (LTS recommended)
- PostgreSQL 14+ (optional, can use in-memory storage)
- Python 3.9+ (for email functionality)

### Steps
1. Extract the application package
2. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```
3. Install dependencies
```bash
./install.sh  # Linux/macOS
install-windows.bat  # Windows
```
4. Start the application
```bash
cd app && npm run start
```

## 3. Docker Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose V2+ (for multi-container setup)

### Option 1: Using Docker Compose
```bash
# Extract the Docker files package
unzip mailchats_trly_apix_v1_docker_files.zip

# Run without database
cd docker-files
docker-compose up -d

# Run with PostgreSQL
docker-compose --profile with-db up -d
```

### Option 2: Using Docker Hub
```bash
# Build and push to Docker Hub
cd docker-files
./docker-hub-deploy.sh yourusername 1.0.0

# Pull and run from Docker Hub
docker pull yourusername/mailchats-apix-v1:1.0.0
docker run -p 3000:3000 -e SESSION_SECRET=your_secret yourusername/mailchats-apix-v1:1.0.0
```

### Option 3: Building Custom Image
```bash
cd docker-files
./build-docker-image.sh --platform linux/amd64,linux/arm64 --push --registry yourusername
```

## 4. Multi-Cloud Deployment

The Docker image can be deployed to any cloud provider that supports Docker containers:

### AWS
- Amazon ECS/EKS for container orchestration
- Amazon RDS for PostgreSQL database

### Azure
- Azure Container Instances/AKS
- Azure Database for PostgreSQL

### GCP
- Google Cloud Run/GKE
- Cloud SQL for PostgreSQL

### Other Providers
- DigitalOcean App Platform/Kubernetes
- Linode/Akamai Compute
- Vultr Kubernetes Engine

## 5. Environment Variables

See `.env.example` for all required and optional variables.

Key variables:
- `PORT`: Web server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string (optional)
- `SESSION_SECRET`: Secret for session encryption
- `DEEPSEEK_API_KEY`: API key for DeepSeek AI features

## 6. Health Monitoring

The application exposes a health endpoint at `/api/health` that returns status information.

For Docker deployments, health checks are configured in the Docker Compose file.

## 7. Backup and Restore

For PostgreSQL deployments, regular database backups are recommended:

```bash
# Backup
pg_dump -U postgres -d mailchats > backup.sql

# Restore
psql -U postgres -d mailchats < backup.sql
```

For Docker volume backups:
```bash
docker run --rm -v mailchats_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```