import express from 'express';
import {
  serveSwaggerDocs,
  setupSwaggerDocs,
  serveSwaggerJson,
} from './middlewares/swaggerMiddleware';
import { checkApiVersion } from './middlewares/versionMiddleware';
import {
  securityHeaders,
  xssProtection,
  parameterProtection,
  sanitizeData,
  csrfProtection,
  sqlInjectionPrevention,
  securityAuditLog,
} from './middlewares/securityMiddleware';

const app = express();

// API versioning
app.use(checkApiVersion);

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', serveSwaggerDocs, setupSwaggerDocs);
  app.get('/api-docs.json', serveSwaggerJson);
}

// Security Middleware
app.use(securityHeaders);
app.use(xssProtection);
app.use(parameterProtection);
app.use(sanitizeData);
app.use(sqlInjectionPrevention);
app.use(securityAuditLog);

// CSRF protection for non-GET requests
app.use(csrfProtection);

// ... rest of your app configuration
