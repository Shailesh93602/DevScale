import { initializeApp } from '@/app';

import { UserRoutes } from './routes/userRoutes';
import logger from './utils/logger';

const routes = [new UserRoutes().getRouter()];

const main = async () => {
  try {
    const apiRoutes = routes;
    await initializeApp(apiRoutes);
  } catch (err) {
    logger.error('[SERVER START]: %s', err);
    process.exit(1);
  }
};

main();
