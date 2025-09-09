# Firebase CI/CD Workflows

This directory contains GitHub Actions workflows for implementing Firebase CI/CD following industry best practices. These workflows handle secure deployment processes, environment management, and proper forking procedures.

## Workflow Overview

### Main Workflows

1. **firebase-hosting-merge.yml**
   - Triggered on pushes to the main branch
   - Validates code quality
   - Builds and deploys to Firebase Hosting production environment
   - Includes proper caching and environment configuration

2. **firebase-hosting-pull-request.yml**
   - Triggered on pull requests to main/develop branches
   - Runs code quality checks
   - Creates preview deployments for easy testing
   - Implements security measures for PR handling

3. **fork-pr-workflow.yml**
   - Handles pull requests from forks securely
   - Performs security validation before building
   - Prevents exposure of sensitive information
   - Adds helpful PR comments for reviewers

4. **multi-environment-deploy.yml**
   - Manual workflow for deploying to specific environments
   - Supports production and staging environments
   - Requires explicit confirmation before deployment
   - Creates deployment tags and notifications

5. **security-scan.yml**
   - Runs security scans on code and dependencies
   - Performs npm audit for vulnerability detection
   - Validates Firebase security rules
   - Scheduled to run weekly and on code changes

### Support Files

1. **environment-config.yml**
   - Reusable workflow for environment configuration
   - Defines environment-specific settings
   - Used by other workflows for consistent configuration

## Environment Management

The workflows support multiple environments:

- **Production**: Live environment for end users
- **Staging**: Pre-production testing environment
- **Preview**: Temporary environments for pull request testing

## Security Features

- Secure handling of secrets and environment variables
- Proper permissions configuration for each workflow
- Special handling for fork pull requests
- Regular security scanning
- Dependency vulnerability checking

## Best Practices Implemented

- Caching for faster builds
- Proper Node.js version management
- Consistent environment configuration
- Deployment tagging for traceability
- Post-deployment notifications
- Code quality validation before deployment

## Usage

### Regular Development

1. Create a branch from `main` or `develop`
2. Make your changes and push to your branch
3. Create a pull request to `main` or `develop`
4. The PR workflow will automatically create a preview deployment
5. After review and approval, merge the PR
6. The merge workflow will automatically deploy to production

### Fork Development

1. Fork the repository
2. Create a branch in your fork
3. Make your changes and push to your branch
4. Create a pull request to the original repository
5. The fork PR workflow will run security validation
6. After review and approval by a team member, the PR can be merged

### Manual Deployment

1. Go to the Actions tab in GitHub
2. Select "Multi-Environment Deployment"
3. Click "Run workflow"
4. Select the environment (production or staging)
5. Type "yes" to confirm
6. Click "Run workflow"