# Google Cloud Platform Deployment Guide for MailChats Trly APIX2

This guide provides comprehensive instructions for deploying MailChats Trly APIX2 on Google Cloud Platform (GCP).

## Architecture Overview

The recommended GCP architecture for MailChats Trly APIX2 consists of:

- **Google Kubernetes Engine (GKE)** for orchestrating application containers
- **Cloud SQL** for PostgreSQL database
- **Memorystore** for Redis (optional, for session management in distributed deployments)
- **Cloud Load Balancing** for distributing traffic
- **Cloud Storage** for storing static assets and backups
- **Cloud Logging and Monitoring** for observability
- **Container Registry** for storing Docker images

## Prerequisites

- Google Cloud Platform account
- gcloud CLI installed and configured
- Docker installed locally
- kubectl installed locally

## Deployment Steps

### 1. Set Up Project and Enable APIs

1. Create a new project (or use an existing one):
   ```bash
   gcloud projects create mailchats-app --name="MailChats Trly APIX2"
   gcloud config set project mailchats-app
   ```

2. Enable required APIs:
   ```bash
   gcloud services enable container.googleapis.com \
     sqladmin.googleapis.com \
     redis.googleapis.com \
     artifactregistry.googleapis.com \
     compute.googleapis.com \
     logging.googleapis.com \
     monitoring.googleapis.com
   ```

### 2. Create Cloud SQL Instance

1. Create a PostgreSQL instance:
   ```bash
   gcloud sql instances create mailchats-db \
     --database-version=POSTGRES_14 \
     --cpu=2 \
     --memory=4GB \
     --region=us-central1 \
     --root-password="your-secure-password"
   ```

2. Create database and user:
   ```bash
   gcloud sql databases create mailchats --instance=mailchats-db
   
   gcloud sql users create mailchats-user \
     --instance=mailchats-db \
     --password="your-secure-user-password"
   ```

### 3. Build and Push Docker Image

1. Create a Container Registry repository:
   ```bash
   gcloud artifacts repositories create mailchats-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="MailChats Trly APIX2 Docker images"
   ```

2. Build and push the Docker image:
   ```bash
   docker build -t us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:latest .
   
   gcloud auth configure-docker us-central1-docker.pkg.dev
   
   docker push us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:latest
   ```

### 4. Create GKE Cluster

1. Create a standard GKE cluster:
   ```bash
   gcloud container clusters create mailchats-cluster \
     --region=us-central1 \
     --num-nodes=2 \
     --machine-type=e2-standard-2
   ```

2. Get credentials for kubectl:
   ```bash
   gcloud container clusters get-credentials mailchats-cluster --region=us-central1
   ```

### 5. Create Kubernetes Secrets

1. Create a secret for database credentials:
   ```bash
   kubectl create secret generic mailchats-db-credentials \
     --from-literal=username=mailchats-user \
     --from-literal=password="your-secure-user-password" \
     --from-literal=database=mailchats \
     --from-literal=instance_connection_name="$(gcloud sql instances describe mailchats-db --format='value(connectionName)')"
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
        image: us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:latest
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
          value: postgresql://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:5432/$(DB_NAME)
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
      - name: cloud-sql-proxy
        image: gcr.io/cloudsql-docker/gce-proxy:1.28.0
        command:
          - "/cloud_sql_proxy"
          - "-instances=$(INSTANCE_CONNECTION_NAME)=tcp:5432"
        env:
        - name: INSTANCE_CONNECTION_NAME
          valueFrom:
            secretKeyRef:
              name: mailchats-db-credentials
              key: instance_connection_name
        securityContext:
          runAsNonRoot: true
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: mailchats-service
spec:
  selector:
    app: mailchats
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 7. Deploy the Application

1. Apply the deployment configuration:
   ```bash
   kubectl apply -f mailchats-deployment.yaml
   ```

2. Check the deployment status:
   ```bash
   kubectl get pods
   kubectl get services
   ```

3. Get the external IP address:
   ```bash
   kubectl get service mailchats-service
   ```

### 8. Set Up Monitoring and Logging

1. Install the Google Cloud Operations (formerly Stackdriver) agents:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/GoogleCloudPlatform/k8s-stackdriver/master/custom-metrics-stackdriver-adapter/deploy/production/adapter.yaml
   ```

2. Create custom dashboards in Cloud Monitoring:
   - Navigate to Cloud Monitoring > Dashboards
   - Create a dashboard for MailChats Trly APIX2
   - Add metrics for CPU, memory, disk, and network usage
   - Add custom metrics for API response times and email sending success rates

### 9. Set Up Cloud Storage for Backups

1. Create a Cloud Storage bucket:
   ```bash
   gsutil mb -l us-central1 gs://mailchats-backups
   ```

2. Set up a cron job for database backups:
   ```bash
   gcloud scheduler jobs create http mailchats-db-backup \
     --schedule="0 2 * * *" \
     --uri="https://your-backup-function-url" \
     --http-method=POST \
     --time-zone="America/New_York"
   ```

## Updating the Application

To update your application:

1. Build and push a new version of your Docker image:
   ```bash
   docker build -t us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:v1.1 .
   docker push us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:v1.1
   ```

2. Update the deployment to use the new image:
   ```bash
   kubectl set image deployment/mailchats-app mailchats=us-central1-docker.pkg.dev/mailchats-app/mailchats-repo/mailchats-trly-apix2:v1.1
   ```

## Scaling the Application

### Vertical Scaling

Update the resource requests and limits in the deployment file:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

Then apply the updated configuration:
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
   kubectl autoscale deployment mailchats-app --min=2 --max=10 --cpu-percent=70
   ```

## Cost Optimization

- Use preemptible VMs for non-critical workloads
- Set up autoscaling to reduce instances during off-peak hours
- Use committed use discounts for predictable workloads
- Enable Cloud Storage lifecycle policies for backups

## Security Best Practices

1. Enable VPC Service Controls
2. Use Identity and Access Management (IAM) with least privilege
3. Enable Cloud Audit Logs
4. Set up Security Command Center
5. Use Binary Authorization for container images

## Troubleshooting

### Common Issues

1. **Cloud SQL connection issues**:
   - Verify the Cloud SQL proxy is running
   - Check the instance connection name
   - Confirm that the service account has appropriate permissions

2. **Pod startup failures**:
   - Check the pod logs: `kubectl logs pod-name`
   - Verify environment variables and secrets are correctly set
   - Check resource limits and constraints

3. **Load balancer issues**:
   - Verify the service type is LoadBalancer
   - Check the health check configuration
   - Confirm firewall rules allow traffic