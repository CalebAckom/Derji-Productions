import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Derji Productions API',
    version: '1.0.0',
    description: 'API documentation for Derji Productions website backend',
    contact: {
      name: 'Derji Productions',
      email: 'info@derji-productions.com',
      url: 'https://derji-productions.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env['API_BASE_URL'] || 'http://localhost:5000',
      description: process.env['NODE_ENV'] === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer <token>',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for external integrations',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Error message',
              },
              code: {
                type: 'string',
                description: 'Error code',
              },
              status: {
                type: 'integer',
                description: 'HTTP status code',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Error timestamp',
              },
              requestId: {
                type: 'string',
                description: 'Request ID for tracking',
              },
              details: {
                type: 'object',
                description: 'Additional error details',
              },
            },
            required: ['message', 'code', 'status', 'timestamp'],
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Validation Error',
              },
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              status: {
                type: 'integer',
                example: 400,
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      description: 'Field name that failed validation',
                    },
                    message: {
                      type: 'string',
                      description: 'Validation error message',
                    },
                    code: {
                      type: 'string',
                      description: 'Validation error code',
                    },
                  },
                },
              },
            },
          },
        },
      },
      RateLimitError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Too many requests from this IP, please try again later.',
              },
              code: {
                type: 'string',
                example: 'RATE_LIMIT_EXCEEDED',
              },
              status: {
                type: 'integer',
                example: 429,
              },
              retryAfter: {
                type: 'string',
                description: 'Time to wait before making another request',
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Success message',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          meta: {
            type: 'object',
            description: 'Additional metadata',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              requestId: {
                type: 'string',
              },
            },
          },
        },
        required: ['message'],
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                description: 'Current page number',
              },
              limit: {
                type: 'integer',
                description: 'Items per page',
              },
              total: {
                type: 'integer',
                description: 'Total number of items',
              },
              totalPages: {
                type: 'integer',
                description: 'Total number of pages',
              },
              hasNext: {
                type: 'boolean',
                description: 'Whether there are more pages',
              },
              hasPrev: {
                type: 'boolean',
                description: 'Whether there are previous pages',
              },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
                status: 401,
                timestamp: '2024-01-01T00:00:00.000Z',
                requestId: 'req-123',
              },
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
                status: 403,
                timestamp: '2024-01-01T00:00:00.000Z',
                requestId: 'req-123',
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Resource not found',
                code: 'NOT_FOUND',
                status: 404,
                timestamp: '2024-01-01T00:00:00.000Z',
                requestId: 'req-123',
              },
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RateLimitError',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
                status: 500,
                timestamp: '2024-01-01T00:00:00.000Z',
                requestId: 'req-123',
              },
            },
          },
        },
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
      },
      SortByParam: {
        name: 'sortBy',
        in: 'query',
        description: 'Field to sort by',
        required: false,
        schema: {
          type: 'string',
        },
      },
      SortOrderParam: {
        name: 'sortOrder',
        in: 'query',
        description: 'Sort order',
        required: false,
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'desc',
        },
      },
      SearchParam: {
        name: 'q',
        in: 'query',
        description: 'Search query',
        required: false,
        schema: {
          type: 'string',
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Services',
      description: 'Service catalog management endpoints',
    },
    {
      name: 'Portfolio',
      description: 'Portfolio and media management endpoints',
    },
    {
      name: 'Bookings',
      description: 'Booking and scheduling endpoints',
    },
    {
      name: 'Contact',
      description: 'Contact form and inquiry endpoints',
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints',
    },
    {
      name: 'Health',
      description: 'System health and monitoring endpoints',
    },
    {
      name: 'Files',
      description: 'File upload and management endpoints',
    },
    {
      name: 'Monitoring',
      description: 'Application monitoring and logging endpoints',
    },
    {
      name: 'Portfolio Media',
      description: 'Endpoints related to portfolio media management',
    },
    {
      name: 'Service Categories',
      description: 'Endpoints related to service category management',
    }
  ],
};

// Swagger options
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

// Generate swagger specification
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add request ID to all API calls from Swagger UI
      req.headers['X-Request-ID'] = `swagger-${Date.now()}`;
      return req;
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #d4af37 }
    .swagger-ui .scheme-container { background: #f8f9fa }
  `,
  customSiteTitle: 'Derji Productions API Documentation',
  customfavIcon: '/favicon.ico',
};

// Setup Swagger documentation
export const setupSwagger = (app: Express): void => {
  // Serve swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Serve swagger JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API documentation redirect
  app.get('/docs', (_req, res) => {
    res.redirect('/api-docs');
  });

  console.log('📚 API Documentation available at /api-docs');
  console.log('📄 Swagger JSON available at /api-docs.json');
};