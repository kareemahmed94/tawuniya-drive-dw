import { NextRequest } from 'next/server';
import { authController } from '@/core/controllers/auth.controller';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password. Automatically creates a wallet for the user.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *                 description: User's password (min 8 characters)
 *               first_name:
 *                 type: string
 *                 example: John
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 example: Doe
 *                 description: User's last name
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: +966501234567
 *                 description: User's phone number (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                       description: JWT authentication token
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email or phone already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: Email already registered
 */
export async function POST(request: NextRequest) {
  return authController.register(request);
}

