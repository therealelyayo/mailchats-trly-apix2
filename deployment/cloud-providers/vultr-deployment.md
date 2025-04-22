# Vultr Deployment Guide for MailChats Trly APIX2

This guide provides detailed instructions for deploying MailChats Trly APIX2 on Vultr Cloud Platform.

## Architecture Overview

The recommended Vultr architecture for MailChats Trly APIX2 consists of:

- **Vultr Kubernetes Engine (VKE)** for running application containers
- **Vultr Database (Managed PostgreSQL)** for the database
- **Load Balancer** for distributing traffic
- **Vultr Object Storage** for storing static assets and backups
- **Vultr Instances** for running auxiliary services

## Prerequisites

- Vultr account
- Vultr CLI installed and configured
- Docker installed locally
- kubectl installed locally

## Deployment Steps

### 1. Create a Managed PostgreSQL Database

1. Log in to the Vultr Control Panel
2. Navigate to Products > Databases
3. Click "Deploy Database"
4. Select PostgreSQL as the database type
5. Choose PostgreSQL 14 as the version
6. Select a plan (at least 2GB RAM)
7. Choose a location close to your users
8. Provide a label: "mailchats-db"
9. Click "Deploy Now"
10. Note down the connection details provided once the database is ready

### 2. Create a Kubernetes Cluster

1. Navigate to Products > Kubernetes
2. Click "Add Cluster"
3. Provide a label: "mailchats-cluster"
4. Select a Kubernetes version (1.24+)
5. Choose a location (same as your database)
6. Configure node pool:
   - Label: "mailchats-nodes"
   - Plan: 2 CPU, 4GB RAM (minimum)
   - Node count: 2
7. Click "Deploy Now"
8. Once the cluster is ready, download the kubeconfig file

### 3. Configure kubectl with VKE

1. Configure kubectl to use the Vultr Kubernetes Engine:
   ```bash
   export KUBECONFIG=/path/to/downloaded/vke-xxx-kubeconfig.yaml
   ```

2. Verify the connection:
   ```bash
   kubectl get nodes
   ```

### 4. Set Up Object Storage

1. Navigate to Products > Object Storage
2. Click "Add Object Storage"
3. Select a location (same as your cluster)
4. Provide a label: "mailchats-storage"
5. Click "Deploy Now"
6. Once ready, create a bucket named "mailchats-backups"
7. Generate S3-compatible API keys for access

### 5. Build and Push Docker Image

Since Vultr doesn't provide a managed container registry, you can use Docker Hub or GitHub Container Registry:

1. Build the Docker image:
   ```bash
   docker build -t yourusername/mailchats-trly-apix2:latest .
   ```

2. Push the image:
   ```bash
   docker push yourusername/mailchats-trly-apix2:latest
   ```

### 6. Create Kubernetes Secrets

1. Create a secret for database connection:
   ```bash
   kubectl create secret generic mailchats-db-credentials \
     --from-literal=host="vultr-db-host.vultrdb.com" \
     --from-literal=username="vultradmin" \
     --from-literal=password="your-db-password" \
     --from-literal=database="mailchats" \
     --from-literal=port="5432"
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

3. Create a secret for object storage access:
   ```bash
   kubectl create secret generic mailchats-storage-credentials \
     --from-literal=s3-access-key="your-access-key" \
     --from-literal=s3-secret-key="your-secret-key" \
     --from-literal=s3-endpoint="your-region.vultrobjects.com" \
     --from-literal=s3-bucket="mailchats-backups"
   ```

### 7. Create Kubernetes Deployment Files

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
        image: yourusername/mailchats-trly-apix2:latest
        imagePullPolicy: Always
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
    kubernetes.io/ingress.class: "vultr-lb"
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
   kubectl get service mailchats-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```

### 9. Set Up Automatic Database Backups

Create a file named `backup-cron.yaml` with the following content:

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
              apt-get update && apt-get install -y python3-pip
              pip install s3cmd
              pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE -f /backup/mailchats-$(date +%Y-%m-%d).sql
              s3cmd --access_key=$S3_ACCESS_KEY --secret_key=$S3_SECRET_KEY \
                --host=$S3_ENDPOINT --host-bucket='%(bucket)s.$S3_ENDPOINT' \
                put /backup/mailchats-$(date +%Y-%m-%d).sql s3://$S3_BUCKET/
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
            - name: S3_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: mailchats-storage-credentials
                  key: s3-access-key
            - name: S3_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: mailchats-storage-credentials
                  key: s3-secret-key
            - name: S3_ENDPOINT
              valueFrom:
                secretKeyRef:
                  name: mailchats-storage-credentials
                  key: s3-endpoint
            - name: S3_BUCKET
              valueFrom:
                secretKeyRef:
                  name: mailchats-storage-credentials
                  key: s3-bucket
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            emptyDir: {}
          restartPolicy: OnFailure
```

Apply the CronJob configuration:
```bash
kubectl apply -f backup-cron.yaml
```

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

3. Install and configure cert-manager for SSL:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.0/cert-manager.yaml
   ```

4. Create an Issuer and Certificate resource for your domain.

## Updating the Application

To update your application:

1. Build and push a new Docker image:
   ```bash
   docker build -t yourusername/mailchats-trly-apix2:v1.1 .
   docker push yourusername/mailchats-trly-apix2:v1.1
   ```

2. Update the deployment:
   ```bash
   kubectl set image deployment/mailchats-app mailchats=yourusername/mailchats-trly-apix2:v1.1
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
1. Log in to the Vultr Control Panel
2. Navigate to Products > Kubernetes
3. Select your cluster
4. Navigate to the "Nodes" tab
5. Click "Add Node" and follow the prompts

## Cost Optimization

- Use appropriately sized resources for your workload
- Schedule backups during off-peak hours
- Implement horizontal autoscaling to handle varying loads
- Use Vultr's hourly billing to your advantage by scaling down during off hours

## Security Best Practices

1. Use Vultr Firewall to restrict access to your cluster
2. Enable database encryption
3. Keep your Kubernetes cluster version updated
4. Regularly update your application and dependencies
5. Set up network policies in Kubernetes

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Verify database credentials and connection string
   - Check if the database is accessible from the Kubernetes cluster
   - Ensure SSL mode is properly configured

2. **Pod startup failures**:
   - Check pod logs: `kubectl logs pod-name`
   - Verify environment variables and secrets
   - Check for resource constraints

3. **Load balancer issues**:
   - Verify the Vultr load balancer is properly provisioned
   - Check if the service is properly annotated
   - Review security group rules

4. **Performance issues**:
   - Monitor resource usage with Vultr Metrics
   - Check for slow database queries
   - Review application logs for errors