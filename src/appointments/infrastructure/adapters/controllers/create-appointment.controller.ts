import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createAppointmentUseCase } from "./dependencies.controller";

export async function createAppointment(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const requestBody = JSON.parse(event.body || '{}');
      
      // Validate required fields
      if (!requestBody.insuredId || !requestBody.scheduleId || !requestBody.countryISO) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing required fields: insuredId, scheduleId, or countryISO'
          })
        };
      }
      
      // Create appointment
      const result = await createAppointmentUseCase.execute({
        insuredId: requestBody.insuredId,
        scheduleId: requestBody.scheduleId,
        countryISO: requestBody.countryISO
      });
      
      return {
        statusCode: 202,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: (error as Error).message
        })
      };
    }
  }