import path from 'node:path';
import { fileURLToPath } from 'node:url';
import moduleAlias from 'module-alias';

// package.json has "type": "module" so __dirname is not defined here.
// Derive it from import.meta.url — the ESM-standard equivalent.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register aliases programmatically for Vercel
moduleAlias.addAliases({
  '@': path.join(__dirname, '..', 'dist'),
  '@utils': path.join(__dirname, '..', 'dist', 'utils'),
  '@types': path.join(__dirname, '..', 'dist', 'types'),
  '@controllers': path.join(__dirname, '..', 'dist', 'controllers'),
  '@repositories': path.join(__dirname, '..', 'dist', 'repositories'),
  '@middlewares': path.join(__dirname, '..', 'dist', 'middlewares'),
  '@services': path.join(__dirname, '..', 'dist', 'services'),
  '@common': path.join(__dirname, '..', 'dist', 'common'),
  '@constants': path.join(__dirname, '..', 'dist', 'common', 'constants'),
  '@config': path.join(__dirname, '..', 'dist', 'config'),
  '@lib': path.join(__dirname, '..', 'dist', 'lib'),
  '@routes': path.join(__dirname, '..', 'dist', 'routes'),
});


import app from '../dist/main.js';

export default app;
