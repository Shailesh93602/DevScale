// GitHub Actions CI/CD pipeline generator
// Produces a complete workflow with lint, test, build, and deploy stages

function generateCICDPipeline(config: {
  language: string;
  testCmd: string;
  buildCmd: string;
  deployTarget: string;
  branches: Record<string, string>;
}): string {
  const { language, testCmd, buildCmd, deployTarget, branches } = config;
  const branchNames = Object.keys(branches);

  const setupStep = language === "node"
    ? `      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci`
    : `      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - run: pip install -r requirements.txt`;

  const lintCmd = language === "node" ? "npm run lint" : "flake8 .";

  const deployStep = deployTarget === "aws-ecs"
    ? `      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      - run: aws ecs update-service --cluster $ENV --service app --force-new-deployment`
    : `      - run: echo "Deploy to ${deployTarget}"`;

  let deployJobs = "";
  for (const [branch, env] of Object.entries(branches)) {
    deployJobs += `
  deploy-${env}:
    needs: [build]
    if: github.ref == 'refs/heads/${branch}' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: ${env}
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifact
${deployStep.replace("$ENV", env)}
`;
  }

  return `name: CI/CD Pipeline

on:
  push:
    branches: [${branchNames.join(", ")}]
  pull_request:
    branches: [${branchNames[0]}]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setupStep}
      - run: ${lintCmd}

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setupStep}
      - run: ${testCmd}
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setupStep}
      - run: ${buildCmd}
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifact
          path: dist/
${deployJobs}`;
}

// Test
const pipeline = generateCICDPipeline({
  language: "node",
  testCmd: "npm test -- --coverage",
  buildCmd: "npm run build",
  deployTarget: "aws-ecs",
  branches: { main: "production", develop: "staging" },
});
console.log(pipeline);
