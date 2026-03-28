import path from 'node:path';
import moduleAlias from 'module-alias';

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


// @ts-expect-error: build folder not yet created during lint
import app from '../dist/main.js';

export default app;
