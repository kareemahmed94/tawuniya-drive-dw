/**
 * OpenAPI Registry (Simplified)
 * 
 * Note: Actual documentation is generated in simple-auto-docs.ts
 * This file exports dummy functions for compatibility with imports
 */

// Dummy registry for compatibility
export const registry = {
  registerComponent: () => {},
  registerPath: () => {},
  definitions: [],
};

/**
 * Generate OpenAPI specification
 * (Not used - see simple-auto-docs.ts instead)
 */
export function generateOpenAPIDocument() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'TW Digital Wallet API',
      version: '1.0.0',
    },
    paths: {},
  };
}
