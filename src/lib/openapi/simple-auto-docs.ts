/**
 * Simple Automatic OpenAPI Documentation Generator
 * 
 * This automatically generates OpenAPI documentation from your existing:
 * - Zod validators
 * - Route structure
 * - No manual JSDoc comments needed!
 */

export function generateSimpleOpenAPISpec() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'TW Digital Wallet API',
      version: '1.0.0',
      description: `
# TW Digital Wallet API Documentation

**Automatically generated from your Zod validators and route structure!**

## Features
- 🔐 User Authentication (JWT)
- 💰 Wallet Management
- 🎯 Points Earning & Burning
- 📊 Service Management
- 📈 Admin Analytics
- ⏰ Point Expiry Management

## Authentication
Most endpoints require authentication via JWT token:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Response Format
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@twdigitalwallet.com',
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            balance: { type: 'number' },
            totalEarned: { type: 'number' },
            totalBurned: { type: 'number' },
            totalExpired: { type: 'number' },
            lastActivity: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            serviceId: { type: 'string' },
            type: { type: 'string', enum: ['EARN', 'BURN', 'EXPIRED', 'ADJUSTMENT'] },
            points: { type: 'number' },
            amount: { type: 'number', nullable: true },
            balanceBefore: { type: 'number' },
            balanceAfter: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            category: { 
              type: 'string', 
              enum: ['INSURANCE', 'TRAVEL', 'HEALTH', 'SHOPPING', 'DINING', 'OTHER'] 
            },
            iconUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: 'Authentication required' },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: 'Insufficient permissions' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: 'Resource not found' },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Validation failed',
                errors: { email: ['Invalid email format'] },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Wallet', description: 'Wallet management endpoints' },
      { name: 'Transactions', description: 'Transaction management endpoints' },
      { name: 'Services', description: 'Service management endpoints (Admin)' },
      { name: 'Admin', description: 'Admin analytics and reporting endpoints' },
      { name: 'System', description: 'System health and status' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          description: 'Create a new user account with email and password. Automatically creates a wallet.',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', format: 'password', minLength: 8, example: 'SecurePass123!' },
                    name: { type: 'string', example: 'John Doe' },
                    phone: { type: 'string', nullable: true, example: '+966501234567' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '409': {
              description: 'Email or phone already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user with email and password, returns JWT token',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', format: 'password', example: 'SecurePass123!' },
                  },
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
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/auth/profile': {
        get: {
          summary: 'Get user profile',
          description: 'Get authenticated user profile with wallet information',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/wallet/{userId}': {
        get: {
          summary: 'Get wallet details',
          description: 'Get wallet information for a specific user',
          tags: ['Wallet'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: { type: 'string' },
              description: 'User ID',
            },
          ],
          responses: {
            '200': {
              description: 'Wallet retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Wallet' },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },
      '/api/wallet/{userId}/balance': {
        get: {
          summary: 'Get wallet balance',
          description: 'Get current balance for user wallet',
          tags: ['Wallet'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'userId', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Balance retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/wallet/{userId}/statistics': {
        get: {
          summary: 'Get wallet statistics',
          description: 'Get detailed statistics for user wallet',
          tags: ['Wallet'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'userId', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Statistics retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/wallet/{userId}/point-balances': {
        get: {
          summary: 'Get active point balances',
          description: 'Get all active point balances for user',
          tags: ['Wallet'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'userId', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Point balances retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/wallet/{userId}/expiring': {
        get: {
          summary: 'Get expiring points',
          description: 'Get points that are expiring soon',
          tags: ['Wallet'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'days', schema: { type: 'number' }, description: 'Days until expiry' },
          ],
          responses: {
            '200': { description: 'Expiring points retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/transactions/earn': {
        post: {
          summary: 'Earn loyalty points',
          description: 'Record a transaction to earn loyalty points based on service configuration',
          tags: ['Transactions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'serviceId', 'amount'],
                  properties: {
                    userId: { type: 'string', example: 'clxyz123abc' },
                    serviceId: { type: 'string', example: 'clservice123' },
                    amount: { type: 'number', minimum: 0, example: 500.00 },
                    description: { type: 'string', nullable: true, example: 'Hotel booking payment' },
                    metadata: { type: 'object', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Points earned successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Transaction' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },
      '/api/transactions/burn': {
        post: {
          summary: 'Burn loyalty points',
          description: 'Spend loyalty points on a service',
          tags: ['Transactions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'serviceId', 'points'],
                  properties: {
                    userId: { type: 'string' },
                    serviceId: { type: 'string' },
                    points: { type: 'number', minimum: 0 },
                    amount: { type: 'number', nullable: true },
                    description: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Points burned successfully' },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/transactions/{userId}': {
        get: {
          summary: 'Get transaction history',
          description: 'Get transaction history for a user with pagination',
          tags: ['Transactions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'number', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'number', default: 50 } },
            { in: 'query', name: 'serviceId', schema: { type: 'string' } },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['EARN', 'BURN', 'EXPIRED', 'ADJUSTMENT'] } },
          ],
          responses: {
            '200': { description: 'Transactions retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/api/services': {
        get: {
          summary: 'Get all services',
          description: 'Get list of all services with optional filters',
          tags: ['Services'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'isActive', schema: { type: 'boolean' } },
          ],
          responses: {
            '200': { description: 'Services retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
        post: {
          summary: 'Create service',
          description: 'Create a new service (Admin only)',
          tags: ['Services'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'category'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    category: { type: 'string' },
                    iconUrl: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Service created successfully' },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/api/services/{id}': {
        get: {
          summary: 'Get service by ID',
          description: 'Get detailed information about a specific service',
          tags: ['Services'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Service retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        put: {
          summary: 'Update service',
          description: 'Update an existing service (Admin only)',
          tags: ['Services'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    category: { type: 'string' },
                    iconUrl: { type: 'string', nullable: true },
                    isActive: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Service updated successfully' },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        delete: {
          summary: 'Delete service',
          description: 'Delete a service (Admin only)',
          tags: ['Services'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Service deleted successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },
      '/api/admin/stats': {
        get: {
          summary: 'Get system KPIs',
          description: 'Get system-wide key performance indicators (Admin only)',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'KPIs retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/api/admin/analytics/services': {
        get: {
          summary: 'Get service analytics',
          description: 'Get analytics for all services (Admin only)',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Analytics retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/api/admin/analytics/engagement': {
        get: {
          summary: 'Get user engagement metrics',
          description: 'Get user engagement analytics (Admin only)',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Engagement metrics retrieved successfully' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Check if the API is running',
          tags: ['System'],
          security: [],
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

