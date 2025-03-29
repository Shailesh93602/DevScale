import './instrument.js';
import { NODE_ENV, PORT } from '@/config';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import * as http from 'http';
import path from 'path';
import requestIp from 'request-ip';
import sharp from 'sharp';
import swaggerUi from 'swagger-ui-express';
import { timeZones } from '@/common/constants/timezone.constants';
import fs from 'fs';
import fsPromise from 'fs/promises';
import errorMiddleware, {
  notFoundMiddleware,
} from './middlewares/errorMiddleware';

const app: Application = express();
const env: string = NODE_ENV || 'development';
const port: string | number = PORT || 8000;
const swaggerFile: string = `${process.cwd()}/swagger/index.json`;
const swaggerData: string = fs.readFileSync(swaggerFile, 'utf8');
const swaggerJSON = JSON.parse(swaggerData);
import bodyParser from 'body-parser';
import logger from './utils/logger.js';
export type RoutesType = () => Router;

const preventPrototypePollution = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the request contains polluted data and remove it
  const pollutingKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key in req.query) {
    if (pollutingKeys.includes(key)) {
      delete req.query[key];
    }
  }
  for (const key in req.body) {
    if (pollutingKeys.includes(key)) {
      delete req.query[key];
    }
  }

  next();
};

function initializeMiddleWares() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({ credentials: true, origin: true }));
  app.use(hpp());
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());
  app.use(cookieParser());
  app.use(requestIp.mw());
  app.use(preventPrototypePollution);
  app.disable('x-powered-by');
  app.use(
    '/assets',
    express.static(path.join(process.cwd(), '/public/assets'))
  );
  app.use('/public', async (req, res, next) => {
    try {
      const imagePath = path.join(process.cwd(), '/public', decodeURI(req.url));
      if (fs.existsSync(imagePath)) {
        if (
          decodeURI(req.url).endsWith('.jpg') ||
          decodeURI(req.url).endsWith('.png')
        ) {
          const imageStream = await fsPromise.readFile(imagePath);
          res.set('Content-Type', 'image/avif');
          res.set('Cache-Control', 'public, max-age=3600');
          try {
            const buffer = await sharp(imageStream).avif().toBuffer();
            res.send(buffer);
          } catch (err) {
            console.error('Error processing image with sharp:', err);
            res.status(500).send('Error processing image');
          }
        } else {
          next();
        }
      } else {
        res.status(404).send('no file exits');
      }
    } catch (error) {
      res.status(404).send(error);
    }
  });
  app.use('/public', express.static(path.join(process.cwd(), '/public')));

  app.use((req, res, next) => {
    const method = req.method.toLowerCase();
    const timezone = req.headers['accept-timezone'] as string;
    if (timeZones[timezone as keyof object] && method === 'get') {
      req.timezone = timezone;
    }

    next();
  });
}
function initializeRoutes(
  routes: {
    router: Router;
  }[]
) {
  routes.forEach((route) => {
    app.use('/api/v1', route.router);
  });
}

function initializeSwagger() {
  app.use(
    '/api-docs/',
    swaggerUi.serve,
    swaggerUi.setup(swaggerJSON, {
      customSiteTitle: 'API Documentation',
    })
  );
}

// function initializeErrorHandling() {
//   app.use(errorMiddleware);
// }

// const createHealthRoute = () => {
//   app.get('/_health', (req: Request, res: Response) => {
//     healthCheck();
//     res.status(200).send('ok');
//   });
// };

export const initializeApp = async (apiRoutes: Router[]) => {
  initializeMiddleWares();
  initializeRoutes(apiRoutes.map((router) => ({ router })));
  initializeSwagger();
  Sentry.setupExpressErrorHandler(app);
  const server = http.createServer(app);
  //invoiceMigration()
  // socket.connect(server);
  server.listen(port, () => {
    logger.info(`=================================`);
    logger.info(`======= ENV: ${env} ========`);
    logger.info(`=================================`);
  });

  // Add error handling middleware last
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
};
