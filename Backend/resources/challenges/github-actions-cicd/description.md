# CI/CD Pipeline with GitHub Actions

Design and implement a production-grade CI/CD pipeline using GitHub Actions. The pipeline should handle the full lifecycle from code validation to deployment, with proper safeguards and optimizations.

## Problem

Given a project configuration, generate a complete GitHub Actions workflow YAML that implements:

1. **CI Stage**: Lint, test, and build the application
2. **CD Stage**: Deploy to the correct environment based on branch
3. **Safeguards**: Environment protection rules, required checks, and rollback capability

---

## Requirements

### CI Jobs
- **Lint**: Run code linting (ESLint, Prettier, etc.)
- **Test**: Run unit and integration tests with coverage reporting
- **Build**: Compile/build the application artifact
- Jobs should run in parallel where possible, with `needs` for dependencies

### CD Jobs
- **Deploy to Staging**: Automatic on merge to develop branch
- **Deploy to Production**: Requires manual approval via GitHub environment protection
- Must use environment secrets (not repository secrets) for deployment credentials

### Optimizations
- Cache dependencies (node_modules, pip cache, etc.)
- Use matrix strategy for multi-version testing if applicable
- Concurrency control to prevent simultaneous deployments
- Artifact passing between jobs

### Security
- Never expose secrets in logs
- Use OIDC for cloud provider authentication where possible
- Pin action versions to SHA, not tags

---

## Examples

**Example 1:**
```text
Input: {
  language: "node",
  testCmd: "npm test",
  buildCmd: "npm run build",
  deployTarget: "aws-ecs",
  branches: { main: "production", develop: "staging" }
}

Output:
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      ...

  deploy-staging:
    needs: [lint, test, build]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    ...

  deploy-production:
    needs: [lint, test, build]
    if: github.ref == 'refs/heads/main'
    environment: production
    ...
```

---

## Constraints

- Workflow must be valid GitHub Actions YAML
- Must handle both push and pull_request events
- Production deployments must require environment approval
- Must include concurrency control
- Secrets must never be hardcoded
- Action versions should be pinned
