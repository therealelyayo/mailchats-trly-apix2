# GitHub Codespaces Development Environment

This directory contains configuration files for GitHub Codespaces, providing a consistent development environment for the MailChats Trly APIX2 project.

## Features

- Pre-configured Node.js and Python environment
- Automatic dependency installation
- Port forwarding for the application (3000)
- VS Code extensions for JavaScript/TypeScript, React, and Python development
- Code formatting and linting on save

## Getting Started

1. Click the "Code" button on the GitHub repository
2. Select the "Codespaces" tab
3. Click "Create codespace on main"
4. Wait for the environment to build and initialize

## Running the Application

Once the Codespace has started, you can run the application with:

```bash
npm run dev
```

This will start the development server, which you can access through the "Ports" tab or by clicking the notification that appears when the application starts.

## Environment Variables

The following environment variables are set by default:

- `PORT`: 3000
- `NODE_ENV`: development

## Troubleshooting

If you encounter any issues with the Codespace setup:

1. Try rebuilding the container: "Codespaces: Rebuild Container"
2. Check the terminal logs for any error messages
3. Review the post-create script output for potential issues

For more persistent issues, please file an issue on the repository.