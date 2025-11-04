import { createSwaggerSpec } from 'next-swagger-doc';

/**
 * Swagger/OpenAPI Configuration
 * Generates API documentation from JSDoc comments
 */
export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'TW Digital Wallet API',
        version: '1.0.0',
        description: `
# TW Digital Wallet API Documentation

A comprehensive loyalty points and digital wallet management system.

## Features
- 🔐 User Authentication (JWT)
- 💰 Wallet Management
- 🎯 Points Earning & Burning
- 📊 Service Management
- 📈 Admin Analytics
- ⏰ Point Expiry Management

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting
- Transaction endpoints: 100 requests per 15 minutes
- Other endpoints: No specific limit

## Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
\`\`\`

Error responses:
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "errors": { "field": ["error details"] }
}
\`\`\`
        `,
        contact: {
          name: 'API Support',
          email: 'support@twdigitalwallet.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.twdigitalwallet.com',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false,
              },
              error: {
                type: 'string',
                example: 'Error message',
              },
              errors: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: 'clxyz123abc',
              },
              email: {
                type: 'string',
                format: 'email',
                example: 'user@example.com',
              },
              name: {
                type: 'string',
                example: 'John Doe',
              },
              phone: {
                type: 'string',
                nullable: true,
                example: '+966501234567',
              },
              role: {
                type: 'string',
                enum: ['CUSTOMER', 'ADMIN'],
                example: 'CUSTOMER',
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Wallet: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              userId: {
                type: 'string',
                format: 'uuid',
              },
              balance: {
                type: 'number',
                example: 1500.50,
              },
              totalEarned: {
                type: 'number',
                example: 5000.00,
              },
              totalBurned: {
                type: 'number',
                example: 3500.00,
              },
              totalExpired: {
                type: 'number',
                example: 100.00,
              },
              lastActivity: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Transaction: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              userId: {
                type: 'string',
                format: 'uuid',
              },
              serviceId: {
                type: 'string',
                format: 'uuid',
              },
              type: {
                type: 'string',
                enum: ['EARN', 'BURN', 'EXPIRED', 'ADJUSTMENT'],
              },
              points: {
                type: 'number',
                example: 100,
              },
              amount: {
                type: 'number',
                nullable: true,
                example: 50.00,
              },
              balanceBefore: {
                type: 'number',
                example: 1000,
              },
              balanceAfter: {
                type: 'number',
                example: 1100,
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
              },
              description: {
                type: 'string',
                nullable: true,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Service: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
                example: 'Hotel Booking',
              },
              description: {
                type: 'string',
                nullable: true,
              },
              category: {
                type: 'string',
                enum: ['INSURANCE', 'TRAVEL', 'HEALTH', 'SHOPPING', 'DINING', 'OTHER'],
              },
              iconUrl: {
                type: 'string',
                format: 'uri',
                nullable: true,
              },
              isActive: {
                type: 'boolean',
              },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 50,
              },
              total: {
                type: 'number',
                example: 150,
              },
              totalPages: {
                type: 'number',
                example: 3,
              },
            },
          },
        },
        responses: {
          UnauthorizedError: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  success: false,
                  error: 'Authentication required',
                },
              },
            },
          },
          ForbiddenError: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  success: false,
                  error: 'Insufficient permissions',
                },
              },
            },
          },
          NotFoundError: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  success: false,
                  error: 'Resource not found',
                },
              },
            },
          },
          ValidationError: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
                example: {
                  success: false,
                  error: 'Validation failed',
                  errors: {
                    email: ['Invalid email format'],
                    password: ['Password must be at least 8 characters'],
                  },
                },
              },
            },
          },
        },
      },
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication endpoints',
        },
        {
          name: 'Wallet',
          description: 'Wallet management endpoints',
        },
        {
          name: 'Transactions',
          description: 'Transaction management endpoints',
        },
        {
          name: 'Services',
          description: 'Service management endpoints (Admin)',
        },
        {
          name: 'Admin',
          description: 'Admin analytics and reporting endpoints',
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  return spec;
};

