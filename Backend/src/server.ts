import { initializeApp } from './app.logic';

import { UserRoutes } from './routes/userRoutes';
import { StreakRoutes } from './routes/streakRoutes';
import logger from './utils/logger';

const routes = [new UserRoutes().getRouter(), new StreakRoutes().getRouter()];

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
