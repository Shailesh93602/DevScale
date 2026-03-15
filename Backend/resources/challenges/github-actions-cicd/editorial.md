# Editorial -- CI/CD Pipeline with GitHub Actions

## Problem Summary

Build a complete CI/CD pipeline with GitHub Actions covering linting, testing, building, and deploying to multiple environments with proper safeguards.

---

## Approach -- Production-Grade Pipeline

### Key Design Decisions

1. **Parallel CI jobs**: Lint and test run in parallel, build depends on both
2. **Branch-based deployment**: Different branches deploy to different environments
3. **Environment protection**: Production requires manual approval
4. **Concurrency control**: Prevent simultaneous deployments

### Complete Workflow

```yaml
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
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifact
          path: dist/

  deploy-staging:
    needs: [build]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifact
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      - run: |
          aws ecs update-service --cluster staging --service app --force-new-deployment

  deploy-production:
    needs: [build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifact
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      - run: |
          aws ecs update-service --cluster production --service app --force-new-deployment
```

---

## Best Practices

1. **Cache dependencies**: `actions/setup-node` with `cache: 'npm'` avoids re-downloading
2. **Artifact passing**: Upload build output, download in deploy jobs
3. **OIDC auth**: Use `role-to-assume` instead of static AWS keys
4. **Concurrency groups**: Prevent race conditions in deployments
5. **Environment protection**: GitHub environments enforce approval workflows
6. **Pin actions**: Use `@v4` minimum, prefer SHA pinning for security

---

## Common Mistakes

- Running deploy on pull_request events (should only deploy on push)
- Not using `needs` to enforce job ordering
- Hardcoding secrets in workflow files
- Missing concurrency control leading to conflicting deployments
- Not uploading/downloading artifacts between jobs
