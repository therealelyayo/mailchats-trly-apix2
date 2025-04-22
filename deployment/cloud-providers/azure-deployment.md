# Microsoft Azure Deployment Guide for MailChats Trly APIX2

This guide provides detailed instructions for deploying MailChats Trly APIX2 on Microsoft Azure.

## Architecture Overview

The recommended Azure architecture for MailChats Trly APIX2 consists of:

- **Azure Kubernetes Service (AKS)** for running the application containers
- **Azure Database for PostgreSQL** for the database
- **Azure Cache for Redis** (optional, for session management in distributed deployments)
- **Azure Load Balancer** for distributing traffic
- **Azure Blob Storage** for storing static assets and backups
- **Azure Monitor** for monitoring and logging
- **Azure Container Registry (ACR)** for storing Docker images

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Docker installed locally
- kubectl installed locally

## Deployment Steps

### 1. Set Up Resource Group

1. Create a new resource group:
   ```bash
   az group create --name mailchats-rg --location eastus
   ```

### 2. Create Azure Database for PostgreSQL

1. Create a PostgreSQL server:
   ```bash
   az postgres server create \
     --resource-group mailchats-rg \
     --name mailchats-pgserver \
     --location eastus \
     --admin-user mailchats_admin \
     --admin-password "YourSecurePassword123!" \
     --sku-name GP_Gen5_2 \
     --version 14
   ```

2. Configure firewall rules to allow Azure services:
   ```bash
   az postgres server firewall-rule create \
     --resource-group mailchats-rg \
     --server mailchats-pgserver \
     --name AllowAllAzureIPs \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0
   ```

3. Create database:
   ```bash
   az postgres db create \
     --resource-group mailchats-rg \
     --server-name mailchats-pgserver \
     --name mailchats
   ```

### 3. Create Azure Container Registry

1. Create a container registry:
   ```bash
   az acr create \
     --resource-group mailchats-rg \
     --name mailchatsacr \
     --sku Standard \
     --admin-enabled true
   ```

2. Log in to the registry:
   ```bash
   az acr login --name mailchatsacr
   ```

3. Build and push the Docker image:
   ```bash
   docker build -t mailchatsacr.azurecr.io/mailchats-trly-apix2:latest .
   docker push mailchatsacr.azurecr.io/mailchats-trly-apix2:latest
   ```

### 4. Create Azure Kubernetes Service Cluster

1. Create an AKS cluster:
   ```bash
   az aks create \
     --resource-group mailchats-rg \
     --name mailchats-aks \
     --node-count 2 \
     --node-vm-size Standard_DS2_v2 \
     --enable-addons monitoring \
     --generate-ssh-keys \
     --attach-acr mailchatsacr
   ```

2. Get credentials for kubectl:
   ```bash
   az aks get-credentials --resource-group mailchats-rg --name mailchats-aks
   ```

### 5. Create Kubernetes Secrets

1. Create a secret for database connection:
   ```bash
   kubectl create secret generic mailchats-db-credentials \
     --from-literal=host="mailchats-pgserver.postgres.database.azure.com" \
     --from-literal=username="mailchats_admin@mailchats-pgserver" \
     --from-literal=password="YourSecurePassword123!" \
     --from-literal=database="mailchats"
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
        image: mailchatsacr.azurecr.io/mailchats-trly-apix2:latest
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
          value: postgresql://$(DB_USERNAME):$(DB_PASSWORD)@$(DB_HOST):5432/$(DB_DATABASE)
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

### 8. Set Up Azure Application Insights for Monitoring

1. Create an Application Insights resource:
   ```bash
   az monitor app-insights component create \
     --app mailchats-insights \
     --location eastus \
     --resource-group mailchats-rg \
     --application-type web
   ```

2. Get the instrumentation key:
   ```bash
   az monitor app-insights component show \
     --app mailchats-insights \
     --resource-group mailchats-rg \
     --query instrumentationKey \
     --output tsv
   ```

3. Add the instrumentation key to your application's environment variables.

### 9. Set Up Azure Blob Storage for Backups

1. Create a storage account:
   ```bash
   az storage account create \
     --name mailchatsbackups \
     --resource-group mailchats-rg \
     --location eastus \
     --sku Standard_LRS
   ```

2. Create a container for backups:
   ```bash
   az storage container create \
     --name backups \
     --account-name mailchatsbackups \
     --auth-mode login
   ```

## Setting Up CI/CD with Azure DevOps

### 1. Create a New Pipeline

1. Sign in to Azure DevOps
2. Navigate to your project
3. Go to Pipelines > New Pipeline
4. Select GitHub as the source
5. Configure your pipeline with the following YAML:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  imageName: 'mailchats-trly-apix2'
  imageTag: '$(Build.BuildId)'

stages:
- stage: Build
  displayName: Build and push Docker image
  jobs:  
  - job: Build
    displayName: Build
    steps:
    - task: Docker@2
      displayName: Build and push image to ACR
      inputs:
        command: buildAndPush
        repository: $(imageName)
        dockerfile: '**/Dockerfile'
        containerRegistry: 'ACR-Connection'
        tags: |
          $(imageTag)
          latest

- stage: Deploy
  displayName: Deploy to AKS
  dependsOn: Build
  jobs:
  - job: Deploy
    displayName: Deploy
    steps:
    - task: KubernetesManifest@0
      displayName: Deploy to AKS
      inputs:
        action: deploy
        kubernetesServiceConnection: 'AKS-Connection'
        manifests: |
          kubernetes/deployment.yaml
          kubernetes/service.yaml
        containers: |
          mailchatsacr.azurecr.io/$(imageName):$(imageTag)
```

### 2. Configure Service Connections

1. In Azure DevOps, go to Project Settings > Service connections
2. Create a service connection to your Azure Container Registry
3. Create a service connection to your Azure Kubernetes Service

## Updating the Application

To update your application:

1. Push changes to your GitHub repository
2. Azure DevOps pipeline will automatically:
   - Build a new Docker image
   - Push the image to ACR
   - Deploy the updated image to AKS

For manual updates:

1. Build and push a new Docker image:
   ```bash
   docker build -t mailchatsacr.azurecr.io/mailchats-trly-apix2:v1.1 .
   docker push mailchatsacr.azurecr.io/mailchats-trly-apix2:v1.1
   ```

2. Update the deployment:
   ```bash
   kubectl set image deployment/mailchats-app mailchats=mailchatsacr.azurecr.io/mailchats-trly-apix2:v1.1
   ```

## Scaling the Application

### Vertical Scaling

Update resource requests and limits in the deployment file and apply the changes:

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

- Use Azure Reserved VM Instances for production AKS nodes
- Schedule auto-scaling based on usage patterns
- Use Azure Spot Instances for development/testing
- Configure storage lifecycle management policies

## Security Best Practices

1. Use Azure Security Center for continuous security assessment
2. Enable Azure Key Vault for secret management
3. Implement Azure Private Link for database access
4. Configure Network Security Groups (NSGs) properly
5. Use Azure Policy for compliance

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Verify firewall rules allow traffic from AKS
   - Check database credentials and connection string
   - Confirm the server name includes the full FQDN

2. **Pod startup failures**:
   - Check pod logs: `kubectl logs pod-name`
   - Verify environment variables and secrets
   - Ensure AKS has permissions to pull from ACR

3. **Application performance issues**:
   - Review Application Insights telemetry
   - Check resource constraints on pods
   - Analyze database query performance