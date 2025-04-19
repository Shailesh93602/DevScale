// This file serves as an entry point for Vercel deployment
// It helps with path resolution for TypeScript path aliases
const path = require('path');

try {
  // Try to load tsconfig-paths
  const tsConfigPaths = require('tsconfig-paths');
  const tsConfig = require('./tsconfig.json');
  const baseUrl = path.join(process.cwd(), 'dist');

  // Register path aliases from tsconfig.json
  tsConfigPaths.register({
    baseUrl,
    paths: Object.fromEntries(
      Object.entries(tsConfig.compilerOptions.paths || {}).map(
        ([key, value]) => [key, value.map((p) => p.replace(/^\.\//g, ''))]
      )
    ),
  });
} catch (error) {
  console.warn('Could not register path aliases:', error.message);
}

// Load the compiled TypeScript code
const app = require('./dist/index');

// Export the Express app for Vercel
module.exports = app.default || app;
