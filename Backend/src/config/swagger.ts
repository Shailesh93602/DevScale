import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduScale API Documentation',
      version,
      description: 'API documentation for EduScale platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'contact@exaveltech.com',
      },
    },
    servers: [
      {
        // API_URL must be set to https:// in production
        url: process.env.API_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Roadmaps', description: 'Roadmap management endpoints' },
      { name: 'Challenges', description: 'Challenge system endpoints' },
      { name: 'Content', description: 'Content management endpoints' },
      { name: 'Community', description: 'Community feature endpoints' },
      { name: 'Analytics', description: 'Analytics and reporting endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);
