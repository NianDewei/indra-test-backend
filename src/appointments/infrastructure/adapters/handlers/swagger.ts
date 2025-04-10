import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

// Function to create a basic Swagger document
const createBasicSwaggerDocument = () => {
  return {
    openapi: "3.0.0",
    info: {
      title: "Appointment API",
      version: "1.0.0",
      description: "API for managing appointments"
    },
    servers: [
      {
        url: "/",
        description: "Default Server"
      }
    ],
    paths: {}
  };
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Use correct path to src/swagger/swagger.json
    const swaggerJsonPath = path.resolve(__dirname, '../../../../../src/swagger/swagger.json');
    let swaggerDocument;
    
    // Check if the file exists
    if (!fs.existsSync(swaggerJsonPath)) {
      console.warn(`Swagger JSON file not found at path: ${swaggerJsonPath}`);
      
      // Create directory if it doesn't exist
      const swaggerDir = path.dirname(swaggerJsonPath);
      if (!fs.existsSync(swaggerDir)) {
        console.log(`Creating swagger directory at: ${swaggerDir}`);
        fs.mkdirSync(swaggerDir, { recursive: true });
      }
      
      // Create a basic swagger.json file
      console.log(`Creating basic swagger.json at: ${swaggerJsonPath}`);
      swaggerDocument = createBasicSwaggerDocument();
      fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerDocument, null, 2), 'utf8');
      console.log(`Basic swagger.json file created successfully`);
    } else {
      // Read the existing file
      const fileContent = fs.readFileSync(swaggerJsonPath, 'utf8');
      try {
        swaggerDocument = JSON.parse(fileContent);
      } catch (parseError) {
        console.error(`Error parsing swagger.json file: ${parseError}`);
        swaggerDocument = createBasicSwaggerDocument();
      }
    }
    
    // Replace placeholder with actual API Gateway URL if we're not running locally
    if (event.requestContext && event.requestContext.domainName) {
      const basePath = event.requestContext.path.replace(/\/swagger(\/.*)?$/, '');
      const baseUrl = `https://${event.requestContext.domainName}${basePath}`;
      
      swaggerDocument.servers = [
        {
          url: baseUrl,
          description: "Current API Gateway"
        },
        ...(swaggerDocument.servers || []).filter((s: any) => s.description !== "Current API Gateway")
      ];
    }

    // If it's a request for the swagger.json file
    if (event.path.endsWith('/swagger.json')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(swaggerDocument)
      };
    }
    
    // Else serve the Swagger UI HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css">
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "./swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
            window.ui = ui;
          }
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
      body: html
    };
  } catch (error) {
    console.error('Error serving Swagger documentation:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to serve Swagger documentation',
        message: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};
