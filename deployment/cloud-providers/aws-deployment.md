# AWS Deployment Guide for MailChats Trly APIX2

This guide provides step-by-step instructions for deploying MailChats Trly APIX2 on Amazon Web Services (AWS).

## Architecture Overview

The recommended AWS architecture for MailChats Trly APIX2 consists of:

- **Amazon ECS (Elastic Container Service)** for running the application containers
- **Amazon RDS** for PostgreSQL database
- **Amazon ElastiCache** for Redis (optional, for session management in multi-container deployments)
- **Application Load Balancer** for distributing traffic
- **Amazon S3** for storing static assets and backups
- **Amazon CloudWatch** for monitoring and logging
- **Amazon ECR** for storing Docker images

## Prerequisites

- AWS Account with administrative access
- AWS CLI installed and configured
- Docker installed locally

## Deployment Steps

### 1. Set Up Database (RDS)

1. Navigate to RDS in the AWS Console
2. Click "Create database"
3. Select "PostgreSQL"
4. Choose PostgreSQL 14 or later
5. Select your preferred instance size (minimum recommendation: db.t3.small)
6. Configure storage (minimum recommendation: 20GB)
7. Enter database details:
   - DB instance identifier: `mailchats-db`
   - Master username: `postgres` (or your preferred username)
   - Master password: (create a strong password)
8. Under "Connectivity":
   - Select your VPC
   - Create a new security group named `mailchats-db-sg`
9. Under "Additional configuration":
   - Initial database name: `mailchats`
10. Click "Create database"

### 2. Create ECR Repository

1. Navigate to Amazon ECR in the AWS Console
2. Click "Create repository"
3. Name: `mailchats-trly-apix2`
4. Click "Create repository"
5. Follow the push commands shown after repository creation:

```bash
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
docker build -t mailchats-trly-apix2 .
docker tag mailchats-trly-apix2:latest your-account-id.dkr.ecr.your-region.amazonaws.com/mailchats-trly-apix2:latest
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/mailchats-trly-apix2:latest
```

### 3. Create ECS Cluster

1. Navigate to ECS in the AWS Console
2. Click "Create Cluster"
3. Select "EC2 Linux + Networking"
4. Configure:
   - Cluster name: `mailchats-cluster`
   - EC2 instance type: t3.small or larger
   - Number of instances: 2 (for high availability)
   - EBS storage: 30 GB
   - Key pair: Select an existing key pair or create new
5. Networking:
   - Select your VPC
   - Select at least two subnets
   - Auto-assign public IP: Enabled
6. Click "Create"

### 4. Create Task Definition

1. Navigate to "Task Definitions" in ECS
2. Click "Create new Task Definition"
3. Select "EC2" as launch type
4. Task Definition Name: `mailchats-task`
5. Add container:
   - Container name: `mailchats-app`
   - Image: your-account-id.dkr.ecr.your-region.amazonaws.com/mailchats-trly-apix2:latest
   - Memory Limits: Soft limit 512 MiB
   - Port mappings: 3000:3000
   - Environment variables:
     - NODE_ENV: production
     - PORT: 3000
     - DATABASE_URL: postgresql://username:password@your-rds-endpoint:5432/mailchats
     - DEEPSEEK_API_KEY: your-deepseek-api-key
     - SESSION_SECRET: your-session-secret
     - SMTP_HOST: your-smtp-host
     - SMTP_PORT: 587
     - SMTP_USER: your-smtp-username
     - SMTP_PASS: your-smtp-password
     - EMAIL_FROM: your-sender-email
6. Click "Add" and then "Create"

### 5. Create Load Balancer

1. Navigate to EC2 > Load Balancers
2. Click "Create Load Balancer"
3. Choose "Application Load Balancer"
4. Configure:
   - Name: `mailchats-lb`
   - Scheme: internet-facing
   - Listeners: HTTP (80), HTTPS (443)
   - Availability Zones: Select at least two
5. Configure security settings:
   - Add your SSL certificate
6. Configure Security Groups:
   - Create a new security group allowing HTTP (80) and HTTPS (443)
7. Configure Routing:
   - Create a new target group: `mailchats-tg`
   - Target type: Instance
   - Protocol: HTTP
   - Port: 3000
   - Health check path: `/api/health`
8. Click "Create"

### 6. Create ECS Service

1. Navigate back to your ECS cluster
2. Click "Create Service"
3. Configure:
   - Launch type: EC2
   - Task Definition: mailchats-task (select the version)
   - Service name: `mailchats-service`
   - Number of tasks: 2
4. Load balancing:
   - Select "Application Load Balancer"
   - Select your load balancer and target group
5. Service discovery: Leave disabled
6. Auto Scaling: Configure as needed
7. Click "Create Service"

### 7. Set Up S3 for Backups

1. Navigate to S3
2. Create a new bucket: `mailchats-backups-your-account-id`
3. Enable versioning and configure lifecycle rules for backup retention

### 8. Configure CloudWatch for Monitoring

1. Navigate to CloudWatch
2. Create a dashboard for your application
3. Set up the following alarms:
   - ECS service CPU utilization > 80%
   - ECS service memory utilization > 80%
   - Load balancer 5XX errors > 10/minute
   - RDS CPU utilization > 80%

## Updating the Application

To update your application:

1. Build and push a new version of your Docker image to ECR
2. Update your ECS service to use the new image:

```bash
aws ecs update-service --cluster mailchats-cluster --service mailchats-service --force-new-deployment
```

## Scaling the Application

### Vertical Scaling

1. Update the task definition with increased memory and CPU
2. Update the service to use the new task definition

### Horizontal Scaling

1. Increase the number of tasks in your service
2. Consider enabling Auto Scaling:

```bash
aws ecs put-scaling-policy --cluster mailchats-cluster --service mailchats-service --policy-name cpu-tracking --policy-type TargetTrackingScaling --scaling-target-id service/mailchats-cluster/mailchats-service --target-tracking-scaling-policy-configuration '{"TargetValue": 70.0, "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"}}'
```

## Cost Optimization

- Use reserved instances for the database and ECS instances
- Set up auto-scaling to reduce capacity during off-peak hours
- Consider using Spot Instances for non-critical workloads
- Enable S3 Intelligent-Tiering for backups

## Security Best Practices

1. Enable AWS WAF on your load balancer
2. Use AWS Secrets Manager for storing sensitive credentials
3. Enable RDS encryption
4. Set up VPC flow logs
5. Use IAM roles with least privilege

## Troubleshooting

### Common Issues

1. **Connection issues to database**:
   - Check security group rules
   - Verify database credentials
   - Check that the database is accessible from the ECS cluster

2. **Service fails to start**:
   - Check CloudWatch logs for container errors
   - Verify all environment variables are correctly set
   - Check the ECS service events for deployment failures

3. **Load balancer health checks failing**:
   - Verify the health check path is correct
   - Check that the application is running on the correct port
   - Review security group rules to ensure traffic can reach the container