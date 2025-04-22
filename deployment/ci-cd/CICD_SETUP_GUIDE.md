# CI/CD Setup Guide for MailChats Trly APIX2

This guide provides instructions for setting up Continuous Integration and Continuous Deployment (CI/CD) for the MailChats Trly APIX2 application.

## GitHub Actions

The repository includes a pre-configured GitHub Actions workflow in `.github/workflows/ci-cd.yml` that handles:

1. **Testing**: Runs the test suite against the codebase
2. **Building**: Creates a Docker image and pushes it to Docker Hub
3. **Deployment**: Automatically deploys to staging and production environments

### Required Secrets

To use the GitHub Actions workflow, add the following secrets to your GitHub repository:

#### Docker Hub Integration
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: A Docker Hub access token with push permissions

#### Staging Environment
- `STAGING_HOST`: Hostname or IP of your staging server
- `STAGING_USERNAME`: SSH username for the staging server
- `STAGING_SSH_KEY`: SSH private key for authentication
- `STAGING_PORT`: SSH port (usually 22)

#### Production Environment
- `PRODUCTION_HOST`: Hostname or IP of your production server
- `PRODUCTION_USERNAME`: SSH username for the production server
- `PRODUCTION_SSH_KEY`: SSH private key for authentication
- `PRODUCTION_PORT`: SSH port (usually 22)

### How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Enter the name and value for each secret listed above

## GitLab CI/CD Alternative

If you're using GitLab instead of GitHub, a sample `.gitlab-ci.yml` configuration is provided in the `deployment/ci-cd` directory. 

To use it:

1. Copy `gitlab-ci.yml` to the root of your repository and rename it to `.gitlab-ci.yml`
2. Configure the necessary CI/CD variables in your GitLab repository settings

## Jenkins Pipeline

For teams using Jenkins, a sample `Jenkinsfile` is provided in the `deployment/ci-cd` directory.

To use it:

1. Copy the `Jenkinsfile` to the root of your repository
2. Configure a Jenkins pipeline job that uses this file
3. Set up the necessary credentials in Jenkins

## Deploying to Different Environments

### Local Development

No CI/CD is needed. Simply use:

```bash
docker-compose up -d
```

### Staging Environment

The staging environment is automatically updated when changes are pushed to the `main` branch.

For manual deployment to staging:

```bash
# SSH into your staging server
ssh user@staging-server

# Navigate to the application directory
cd /opt/mailchats

# Pull the latest image and restart containers
docker-compose pull
docker-compose up -d
```

### Production Environment

The production environment is automatically updated after successful deployment to staging.

For manual deployment to production:

```bash
# SSH into your production server
ssh user@production-server

# Navigate to the application directory
cd /opt/mailchats

# Pull the latest image and restart containers
docker-compose pull
docker-compose up -d
```

## Rollback Procedure

If a deployment causes issues, follow these steps to roll back:

1. SSH into the affected server
2. Navigate to the application directory
3. Pull a specific previous image version:
   ```bash
   docker-compose down
   # Edit your docker-compose.yml to use a specific version tag
   # e.g., change 'therealelyayo/mailchats-trly-apix2:latest' to 'therealelyayo/mailchats-trly-apix2:v1.2.3'
   docker-compose up -d
   ```

## Monitoring Deployments

Each deployment triggers notifications in:

1. GitHub/GitLab status updates
2. Optional Slack notifications (configure webhook in CI/CD settings)
3. Email notifications to repository administrators

## Setting Up Deployment Notifications

### Slack Notifications

Add a Slack webhook URL to your CI/CD environment variables:

- GitHub: Add `SLACK_WEBHOOK_URL` secret
- GitLab: Add `SLACK_WEBHOOK_URL` CI/CD variable
- Jenkins: Configure the Slack Notification plugin

### Email Notifications

Email notifications are handled automatically by GitHub/GitLab to repository administrators.

For Jenkins, configure the Email Extension Plugin with your SMTP settings.