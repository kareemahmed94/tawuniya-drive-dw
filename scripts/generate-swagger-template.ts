#!/usr/bin/env ts-node

/**
 * Swagger Documentation Template Generator
 * 
 * This script helps generate Swagger documentation templates for API routes
 * 
 * Usage:
 *   npx ts-node scripts/generate-swagger-template.ts <method> <path> <tag>
 * 
 * Example:
 *   npx ts-node scripts/generate-swagger-template.ts POST /api/users User
 */

const method = process.argv[2]?.toUpperCase() || 'GET';
const path = process.argv[3] || '/api/resource';
const tag = process.argv[4] || 'Resource';

const templates: Record<string, string> = {
  GET: `/**
 * @swagger
 * ${path}:
 *   get:
 *     summary: Get ${tag.toLowerCase()}
 *     description: Retrieve ${tag.toLowerCase()} information
 *     tags:
 *       - ${tag}
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${tag} ID
 *     responses:
 *       200:
 *         description: ${tag} retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/${tag}'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */`,

  POST: `/**
 * @swagger
 * ${path}:
 *   post:
 *     summary: Create ${tag.toLowerCase()}
 *     description: Create a new ${tag.toLowerCase()}
 *     tags:
 *       - ${tag}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 example: Example value
 *               field2:
 *                 type: string
 *                 example: Another value
 *     responses:
 *       201:
 *         description: ${tag} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/${tag}'
 *                 message:
 *                   type: string
 *                   example: ${tag} created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */`,

  PUT: `/**
 * @swagger
 * ${path}:
 *   put:
 *     summary: Update ${tag.toLowerCase()}
 *     description: Update an existing ${tag.toLowerCase()}
 *     tags:
 *       - ${tag}
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${tag} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: string
 *     responses:
 *       200:
 *         description: ${tag} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/${tag}'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */`,

  DELETE: `/**
 * @swagger
 * ${path}:
 *   delete:
 *     summary: Delete ${tag.toLowerCase()}
 *     description: Delete an existing ${tag.toLowerCase()}
 *     tags:
 *       - ${tag}
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${tag} ID
 *     responses:
 *       200:
 *         description: ${tag} deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ${tag} deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */`,

  PATCH: `/**
 * @swagger
 * ${path}:
 *   patch:
 *     summary: Partially update ${tag.toLowerCase()}
 *     description: Update specific fields of ${tag.toLowerCase()}
 *     tags:
 *       - ${tag}
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${tag} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: ${tag} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/${tag}'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */`,
};

console.log('\n' + '='.repeat(80));
console.log(`Swagger Documentation Template for ${method} ${path}`);
console.log('='.repeat(80) + '\n');

if (templates[method]) {
  console.log(templates[method]);
  console.log('\n' + '='.repeat(80));
  console.log('Copy the above template and paste it above your route handler');
  console.log('='.repeat(80) + '\n');
} else {
  console.error(`Unknown HTTP method: ${method}`);
  console.log('\nSupported methods: GET, POST, PUT, PATCH, DELETE');
  process.exit(1);
}

