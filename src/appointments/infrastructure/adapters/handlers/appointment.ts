import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { handleSQSEvent } from './sqs.handler';
import { handleAPIGatewayEvent } from './api-gateway-event.handler';

export const handler = async (event: APIGatewayProxyEvent | SQSEvent): Promise<APIGatewayProxyResult | void> => {
    try {
      // Check if it's an SQS event (for completing appointments)
      if ('Records' in event && event.Records[0]?.eventSource === 'aws:sqs') {
        return handleSQSEvent(event);
      }
      
      // Otherwise, handle it as an API Gateway event
      return await handleAPIGatewayEvent(event as APIGatewayProxyEvent);
    } catch (error) {
      console.error('Error in appointment handler:', error);
      
      // Return error response for API Gateway events
      if (!('Records' in event)) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Internal server error',
            message: (error as Error).message
          })
        };
      }
    }
  };