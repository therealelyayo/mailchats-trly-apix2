# DigitalOcean Deployment Guide for MailChats Trly APIX2

This guide provides detailed instructions for deploying MailChats Trly APIX2 on DigitalOcean.

## Architecture Overview

The recommended DigitalOcean architecture for MailChats Trly APIX2 consists of:

- **DigitalOcean Kubernetes (DOKS)** for running application containers
- **DigitalOcean Managed PostgreSQL** for the database
- **DigitalOcean Load Balancer** for distributing traffic
- **DigitalOcean Spaces** for storing static assets and backups
- **DigitalOcean Container Registry (DOCR)** for storing Docker images
- **DigitalOcean Monitoring** for system metrics and alerts

## Prerequisites

- DigitalOcean account
- doctl CLI installed and configured
- Docker installed locally
- kubectl installed locally

## Deployment Steps

### 1. Create PostgreSQL Database Cluster

1. Create a managed PostgreSQL database:
   ```bash
   doctl databases create mailchats-db \
     --engine pg \
     --version 14 \
     --region nyc1 \
     --num-nodes 1 \
     --size db-s-2vcpu-4gb
   ```

2. Retrieve the database connection details:
   ```bash
   doctl databases connection mailchats-db --format Host,Port,User,Password,Database
   ```

3. Create a separate database for MailChats:
   ```bash
   doctl databases db create mailchats-db mailchats
   ```

### 2. Create Container Registry

1. Create a container registry:
   ```bash
   doctl registry create mailchats-registry
   ```

2. Log in to the registry:
   ```bash
   doctl registry login
   ```

3. Build and push the Docker image:
   ```bash
   docker build -t registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:latest .
   docker push registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:latest
   ```

### 3. Create a Kubernetes Cluster

1. Create a DOKS cluster:
   ```bash
   doctl kubernetes cluster create mailchats-cluster \
     --region nyc1 \
     --size s-2vcpu-4gb \
     --count 2
   ```

2. Get credentials for kubectl:
   ```bash
   doctl kubernetes cluster kubeconfig save mailchats-cluster
   ```

3. Verify connection:
   ```bash
   kubectl get nodes
   ```

### 4. Create Kubernetes Secrets

1. Create a secret for database connection:
   ```bash
   kubectl create secret generic mailchats-db-credentials \
     --from-literal=host="your-db-host" \
     --from-literal=username="your-db-username" \
     --from-literal=password="your-db-password" \
     --from-literal=database="mailchats" \
     --from-literal=port="25060"
   ```

2. Create a secret for application environment variables:
   ```bash
   kubectl create secret generic mailchats-app-env \
     --from-literal=NODE_ENV=production \
     --from-literal=SESSION_SECRET="your-session-secret" \
     --from-literal=DEEPSEEK_API_KEY="your-deepseek-api-key" \
     --from-literal=SMTP_HOST="your-smtp-host" \
     --from-literal=SMTP_PORT="587" \
     --from-literal=SMTP_USER="your-smtp-username" \
     --from-literal=SMTP_PASS="your-smtp-password" \
     --from-literal=EMAIL_FROM="your-sender-email"
   ```

### 5. Create Storage Space for Backups

1. Create a Spaces bucket:
   ```bash
   doctl spaces create mailchats-backups --region nyc1
   ```

2. Generate Spaces access keys:
   ```bash
   doctl spaces access-key create
   ```

### 6. Create Kubernetes Deployment Files

Create a file named `mailchats-deployment.yaml` with the following content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mailchats-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mailchats
  template:
    metadata:
      labels:
        app: mailchats
    spec:
      containers:
      - name: mailchats
        image: registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: NODE_ENV
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: SESSION_SECRET
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: DEEPSEEK_API_KEY
        - name: SMTP_HOST
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: SMTP_HOST
        - name: SMTP_PORT
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: SMTP_PORT
        - name: SMTP_USER
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: SMTP_USER
        - name: SMTP_PASS
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: SMTP_PASS
        - name: EMAIL_FROM
          valueFrom:
            secretKeyRef:
              name: mailchats-app-env
              key: EMAIL_FROM
        - name: DATABASE_URL
          value: postgresql://$(DB_USERNAME):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_DATABASE)?sslmode=require
        envFrom:
        - secretRef:
            name: mailchats-db-credentials
            optional: false
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mailchats-service
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-protocol: "http"
    service.beta.kubernetes.io/do-loadbalancer-algorithm: "round_robin"
    service.beta.kubernetes.io/do-loadbalancer-tls-ports: "443"
    service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https: "true"
spec:
  type: LoadBalancer
  selector:
    app: mailchats
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: https
    port: 443
    targetPort: 3000
```

### 7. Allow Kubernetes to Access Container Registry

1. Integrate DOCR with DOKS:
   ```bash
   doctl kubernetes cluster registry add mailchats-cluster
   ```

### 8. Deploy the Application

1. Apply the deployment configuration:
   ```bash
   kubectl apply -f mailchats-deployment.yaml
   ```

2. Check the deployment status:
   ```bash
   kubectl get pods
   kubectl get services
   ```

3. Get the load balancer IP address:
   ```bash
   kubectl get service mailchats-service
   ```

### 9. Set Up Monitoring and Alerts

1. Configure DigitalOcean Monitoring:
   - Navigate to the Monitoring section in DigitalOcean dashboard
   - Create alerts for CPU, memory, and disk usage
   - Set up notifications for alert triggers

## Setting Up a Custom Domain

1. Get the Load Balancer IP address:
   ```bash
   kubectl get service mailchats-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```

2. Add an A record in your DNS provider:
   - Domain: mailchats.com
   - Type: A
   - Value: [Load Balancer IP]
   - TTL: 3600 (or as preferred)

## Setting Up Automatic Database Backups

1. Create a backup configuration file named `backup-cron.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mailchats-db-backup
spec:
  schedule: "0 2 * * *"  # Every day at 2:00 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE -f /backup/mailchats-$(date +%Y-%m-%d).sql
              s3cmd put /backup/mailchats-$(date +%Y-%m-%d).sql s3://mailchats-backups/
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: mailchats-db-credentials
                  key: password
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: mailchats-db-credentials
                  key: host
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mailchats-db-credentials
                  key: username
            - name: DB_DATABASE
              valueFrom:
                secretKeyRef:
                  name: mailchats-db-credentials
                  key: database
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            emptyDir: {}
          restartPolicy: OnFailure
```

2. Apply the CronJob configuration:
   ```bash
   kubectl apply -f backup-cron.yaml
   ```

## Updating the Application

To update your application:

1. Build and push a new Docker image:
   ```bash
   docker build -t registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:v1.1 .
   docker push registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:v1.1
   ```

2. Update the deployment:
   ```bash
   kubectl set image deployment/mailchats-app mailchats=registry.digitalocean.com/mailchats-registry/mailchats-trly-apix2:v1.1
   ```

## Scaling the Application

### Vertical Scaling

1. Update the Kubernetes deployment resource limits
2. Apply the updated configuration:
   ```bash
   kubectl apply -f mailchats-deployment.yaml
   ```

### Horizontal Scaling

1. Manual scaling:
   ```bash
   kubectl scale deployment mailchats-app --replicas=4
   ```

2. Automatic scaling:
   ```bash
   kubectl autoscale deployment mailchats-app --min=2 --max=5 --cpu-percent=70
   ```

### Cluster Scaling

To add more nodes to your Kubernetes cluster:
```bash
doctl kubernetes cluster node-pool update mailchats-cluster default --count=3
```

## Cost Optimization

- Use appropriately sized resources for your workload
- Schedule backups during off-peak hours
- Implement horizontal autoscaling to handle varying loads
- Consider using reserved droplets for long-term cost savings

## Security Best Practices

1. Enable DigitalOcean Cloud Firewalls
2. Use VPC networks to isolate resources
3. Keep container images and dependencies updated
4. Enable database encryption
5. Apply security updates regularly

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Verify database credentials and connection string
   - Check if the database is accessible from the Kubernetes cluster
   - Ensure SSL mode is properly configured

2. **Container registry access problems**:
   - Verify the registry integration with the Kubernetes cluster
   - Check image pull secrets configuration

3. **Load balancer issues**:
   - Check load balancer configuration and health checks
   - Verify that ports are correctly mapped
   - Review firewall rules

4. **Performance issues**:
   - Monitor resource usage with DigitalOcean Monitoring
   - Check for slow database queries
   - Review application logs for errors