import { SQSEvent } from "aws-lambda";
import { completeAppointmentUseCase } from "../controllers/dependencies.controller";

export async function handleSQSEvent(event: SQSEvent): Promise<void> {
    for (const record of event.Records) {
      try {
        const body = JSON.parse(record.body);
        const detail = JSON.parse(body.detail);
        
        // Complete the appointment
        await completeAppointmentUseCase.execute(detail.id);
        console.log(`Appointment ${detail.id} marked as completed`);
      } catch (error) {
        console.error('Error processing SQS message:', error);
        throw error; 
      }
    }
  }
  