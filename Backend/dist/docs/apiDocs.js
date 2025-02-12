"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiDocs = {
    openapi: '3.0.0',
    info: {
        title: 'Learning Platform API',
        version: '1.0.0',
        description: 'API documentation for the Learning Platform',
    },
    servers: [
        {
            url: 'http://localhost:3000/api/v1',
            description: 'Development server',
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
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    code: { type: 'string' },
                    details: { type: 'object' },
                },
            },
        },
    },
    paths: {
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'User login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        user: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        // ... more endpoint documentation
    },
};
exports.default = apiDocs;
//# sourceMappingURL=apiDocs.js.map