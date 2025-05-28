import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Embedded Swagger document - no file system access needed
const swaggerDocument = {
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
  paths: {
    "/appointments": {
      post: {
        summary: "Create a new appointment",
        description: "Creates a new appointment for an insured person",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  insuredId: { type: "string" },
                  scheduleId: { type: "number" },
                  countryISO: { type: "string", enum: ["PE", "CL"] }
                },
                required: ["insuredId", "scheduleId", "countryISO"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Appointment created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    insuredId: { type: "string" },
                    scheduleId: { type: "number" },
                    countryISO: { type: "string" },
                    status: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/appointments/{insuredId}": {
      get: {
        summary: "Get appointments by insured ID",
        description: "Returns all appointments for a specific insured ID",
        parameters: [
          {
            name: "insuredId",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "ID of the insured person"
          }
        ],
        responses: {
          "200": {
            description: "List of appointments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "number" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          insuredId: { type: "string" },
                          scheduleId: { type: "number" },
                          countryISO: { type: "string" },
                          status: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Use the embedded swagger document
    let updatedSwaggerDocument = {...swaggerDocument};
    
    // Replace placeholder with actual API Gateway URL if we're not running locally
    if (event.requestContext && event.requestContext.domainName) {
      const basePath = event.requestContext.path.replace(/\/swagger(\/.*)?$/, '');
      const baseUrl = `https://${event.requestContext.domainName}${basePath}`;
      
      updatedSwaggerDocument.servers = [
        {
          url: baseUrl,
          description: "Current API Gateway"
        },
        ...(updatedSwaggerDocument.servers || []).filter((s: any) => s.description !== "Current API Gateway")
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
        body: JSON.stringify(updatedSwaggerDocument)
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
