# GitHub Codespaces Guide for MailChats Trly APIX2

This guide explains how to deploy and work with MailChats Trly APIX2 using GitHub Codespaces, a cloud-based development environment provided by GitHub.

## What is GitHub Codespaces?

GitHub Codespaces provides cloud-hosted development environments for any GitHub repository. It allows you to develop entirely in the cloud using Visual Studio Code and a containerized environment configured specifically for your project.

## Benefits of Using Codespaces for MailChats

- **Consistent Environment**: Every team member works in an identical, pre-configured environment
- **Zero Local Setup**: No need to install Node.js, PostgreSQL, or other dependencies locally
- **Powerful Resources**: Access to cloud-based compute resources
- **Seamless Integration**: Built-in GitHub integration for version control
- **Accessibility**: Develop from any device with a web browser

## Getting Started

### Creating a Codespace

1. Navigate to the MailChats Trly APIX2 repository on GitHub
2. Click the green "Code" button
3. Select the "Codespaces" tab
4. Click "Create codespace on main"

The Codespace will take 1-2 minutes to set up. Once ready, you'll have a fully configured VS Code environment in your browser.

### Understanding the Codespace Configuration

The Codespace is configured using the following files:

- `.devcontainer/devcontainer.json`: Main configuration file
- `.devcontainer/docker-compose.yml`: Defines the services (app and database)
- `.devcontainer/Dockerfile`: Container image definition

These files ensure that the Codespace has:
- Node.js 18
- PostgreSQL 14
- Python 3.10
- All necessary VS Code extensions
- Pre-configured database connections
- Docker-in-Docker support

## Development Workflow

### Starting the Application

1. Once the Codespace is ready, open a terminal in VS Code
2. Navigate to the app directory:
   ```bash
   cd app
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Click the "Open in Browser" button when it appears, or navigate to the "PORTS" tab and click the link for port 3000

### Database Management

The PostgreSQL database is automatically set up with:
- Database: `mailchats`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

You can access the database directly using:

1. The VS Code SQL Tools extension (pre-configured)
2. Command line:
   ```bash
   psql -h localhost -U postgres -d mailchats
   ```

### Working with API Keys

For features requiring API keys (like DeepSeek AI):

1. Create a `.env` file in the `app` directory:
   ```bash
   echo "DEEPSEEK_API_KEY=your-api-key" > app/.env
   ```

2. Restart the application if it's already running

### Python Email Scripts

To work with the Python email utilities:

1. Navigate to the attached_assets directory:
   ```bash
   cd attached_assets
   ```

2. Run the scripts directly, e.g.:
   ```bash
   python3 send_email.py --help
   ```

## Customizing Your Codespace

### Installing Additional VS Code Extensions

1. Click the Extensions icon in the sidebar
2. Search for and install any extensions you need

### Installing Additional npm Packages

```bash
cd app
npm install your-package-name
```

### Persisting Customizations

Your Codespace will persist when you close your browser. However, Codespaces that haven't been used for 30 days may be automatically deleted.

To ensure your customizations persist:

1. Commit any configuration changes to the repository
2. For personal preferences, use VS Code Settings Sync

## Production Deployment from Codespaces

Codespaces can also be used to deploy the application to production:

1. Build the Docker image:
   ```bash
   docker build -t mailchats-trly-apix2:latest .
   ```

2. For local testing with Docker Compose:
   ```bash
   # Modern Docker installations use this syntax
   docker compose up
   
   # Legacy Docker Compose installations use this syntax
   docker-compose up
   ```

3. Follow the deployment guides in the `deployment` directory for your target environment.

## Troubleshooting

### Container Fails to Start

If the Codespace container fails to start:

1. Try creating a new Codespace
2. Check the logs in the "Creation Log" tab
3. Verify that your devcontainer configuration is valid

### Docker Compose Version Compatibility

This project supports both modern and legacy Docker Compose syntax:

- Modern Docker installations (Docker Compose V2):
  ```bash
  docker compose config
  docker compose up
  ```

- Legacy Docker Compose installations (Docker Compose V1):
  ```bash
  docker-compose config
  docker-compose up
  ```

If you encounter an error with one version, try the other syntax based on your Docker installation.

### Application Cannot Connect to Database

If the application cannot connect to the database:

1. Check that PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Verify the database connection string in your environment variables
3. Ensure the database is initialized:
   ```bash
   cd app && npm run db:push
   ```

### Port Forwarding Issues

If you cannot access the application in the browser:

1. Check the "PORTS" tab in VS Code
2. Ensure port 3000 is forwarded and set to "Public" visibility
3. Try manually forwarding the port:
   ```bash
   gh codespace ports forward 3000:3000
   ```

## Additional Resources

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/codespaces)
- [Developing in Codespaces](https://docs.github.com/en/codespaces/developing-in-codespaces)