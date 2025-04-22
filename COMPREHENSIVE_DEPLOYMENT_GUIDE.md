# Comprehensive Deployment Guide for MailChats Trly APIX2

This guide provides detailed instructions for deploying the MailChats Trly APIX2 application in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
   - [Docker Deployment](#docker-deployment)
   - [Cloud Provider Deployment](#cloud-provider-deployment)
   - [Manual Deployment](#manual-deployment)
4. [Database Setup](#database-setup)
5. [Scaling Considerations](#scaling-considerations)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying MailChats Trly APIX2, ensure you have the following:

- Node.js (v18+)
- PostgreSQL (v14+)
- Docker and Docker Compose (if using containerized deployment)
- DeepSeek AI API key for AI-powered features
- SMTP server credentials for email sending capabilities

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Port on which the server will run | No | 3000 |
| `NODE_ENV` | Environment (development, production) | No | development |
| `DATABASE_URL` | PostgreSQL connection URL | Yes | - |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key for smart features | Yes | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `SMTP_HOST` | SMTP server hostname | Yes | - |
| `SMTP_PORT` | SMTP server port | Yes | 587 |
| `SMTP_USER` | SMTP username | Yes | - |
| `SMTP_PASS` | SMTP password | Yes | - |
| `EMAIL_FROM` | Default sender email address | Yes | - |

## Deployment Options

### Docker Deployment

The simplest way to deploy MailChats Trly APIX2 is using Docker and Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/therealelyayo/mailchats-trly-apix2.git
   cd mailchats-trly-apix2
   ```

2. **Create an environment file** (`.env`) with your settings:
   ```
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@postgres:5432/mailchats
   DEEPSEEK_API_KEY=your_deepseek_api_key
   SESSION_SECRET=your_session_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   EMAIL_FROM=your_sender_email
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - The MailChats Trly APIX2 application
   - PostgreSQL database
   - Adminer for database management (optional, accessible at port 8080)

4. **Access the application** at `http://your-server-ip:3000`

### Cloud Provider Deployment

See specific deployment guides for:
- [AWS Deployment Guide](deployment/cloud-providers/aws-deployment.md)
- [GCP Deployment Guide](deployment/cloud-providers/gcp-deployment.md)
- [Azure Deployment Guide](deployment/cloud-providers/azure-deployment.md)
- [DigitalOcean Deployment Guide](deployment/cloud-providers/digitalocean-deployment.md)
- [Vultr Deployment Guide](deployment/cloud-providers/vultr-deployment.md)

### Manual Deployment

For environments where Docker is not available:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/therealelyayo/mailchats-trly-apix2.git
   cd mailchats-trly-apix2/app
   ```

2. **Install dependencies**:
   ```bash
   npm install --production
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Configure environment variables** as described above.

5. **Start the application**:
   ```bash
   npm start
   ```

6. Consider using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/server/index.js --name mailchats
   pm2 save
   pm2 startup
   ```

## Database Setup

The application requires a PostgreSQL database. The schema is managed using Drizzle ORM.

1. **Create the database**:
   ```sql
   CREATE DATABASE mailchats;
   CREATE USER mailchats_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE mailchats TO mailchats_user;
   ```

2. **Push the schema**:
   ```bash
   npm run db:push
   ```

## Scaling Considerations

### Horizontal Scaling

The application is designed to scale horizontally. For high-traffic deployments:

1. **Use a load balancer** to distribute traffic across multiple application instances
2. **Set up session sharing** across instances using Redis or similar
3. **Configure database connection pooling** appropriately

### Vertical Scaling

For lower-traffic deployments, vertical scaling may be sufficient:

1. **Increase server resources** (CPU/RAM)
2. **Optimize database queries** and indexing
3. **Increase connection pool size** for the database

## Security Best Practices

1. **Use HTTPS** in production
2. **Implement rate limiting** to prevent abuse
3. **Set secure and HTTP-only flags** on cookies
4. **Regularly update dependencies** to patch security vulnerabilities
5. **Use a Web Application Firewall (WAF)** for additional protection

## Monitoring and Logging

1. **Application logs**: The application logs to stdout/stderr in JSON format
2. **Recommended monitoring solutions**:
   - Prometheus + Grafana for metrics
   - ELK Stack for log aggregation
   - Sentry for error tracking

3. **Key metrics to monitor**:
   - API response times
   - Email sending success rates
   - Database query performance
   - Memory usage

## Backup and Disaster Recovery

1. **Database Backups**:
   - Schedule regular PostgreSQL dumps
   - Consider point-in-time recovery setup
   - Store backups in secure, offsite location

2. **Application Recovery**:
   - Maintain infrastructure as code
   - Document recovery procedures
   - Regularly test restoration process

## Troubleshooting

### Common Issues

1. **Application fails to start**:
   - Check environment variables
   - Verify database connection
   - Check for port conflicts

2. **Emails not sending**:
   - Verify SMTP credentials
   - Check network connectivity to SMTP server
   - Review email service logs

3. **Database connection issues**:
   - Verify connection string format
   - Check database server is running and accessible
   - Confirm user permissions

4. **AI features not working**:
   - Verify DeepSeek API key
   - Check network connectivity to DeepSeek API
   - Review API response logs

For additional support, please open an issue on the GitHub repository.