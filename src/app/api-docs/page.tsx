'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

/**
 * API Documentation Page
 * Displays interactive Swagger UI for API exploration
 */
export default function ApiDocsPage() {
  return (
    <div className="api-docs-container">
      <SwaggerUI url="/api/docs" />
      
      <style jsx global>{`
        .api-docs-container {
          min-height: 100vh;
        }
        
        .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          font-size: 36px;
          color: #3b4151;
        }
        
        .swagger-ui .scheme-container {
          background: #fafafa;
          padding: 20px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

