import { SQSEvent } from "aws-lambda";
import { ProcessCountryAppointmentUseCase } from "../../../application/uses-cases/proccess-country-appointment.use-case";
import { CountryServiceFactory } from "../../ports/services/factory/country-factory.service";
import { Appointment } from "../../../domain/entities/appointment.entity";

export const handler = async (event: SQSEvent): Promise<void> => {
    const COUNTRY_ISO = 'PE';
    console.log(`Processing ${COUNTRY_ISO} appointments`);
    
    try {
        // Initialize country-specific services using the factory pattern
        const scheduleRepository = CountryServiceFactory.createMySQLScheduleRepository(COUNTRY_ISO);
        const eventBusService = CountryServiceFactory.createEventBridgeService(COUNTRY_ISO);
        const mysqlAppointmentRepository = CountryServiceFactory.createMySQLAppointmentRepository(COUNTRY_ISO);
        
        // Initialize use case
        const processAppointmentUseCase = new ProcessCountryAppointmentUseCase(
          scheduleRepository,
          eventBusService
        );
        
        // Process each message from the queue
        for (const record of event.Records) {
          try {
            // Parse the SQS message body
            const appointmentData = JSON.parse(record.body);
            
            // Validate that the appointment is for the correct country
            if (appointmentData.countryISO !== COUNTRY_ISO) {
              throw new Error(`Invalid country in message. Expected: ${COUNTRY_ISO}, Received: ${appointmentData.countryISO}`);
            }
            
            // Create domain entity
        const appointment = new Appointment({
          id: appointmentData.id,
          insuredId: appointmentData.insuredId,
          scheduleId: appointmentData.scheduleId,
          countryISO: appointmentData.countryISO,
          status: appointmentData.status,
          createdAt: appointmentData.createdAt,
          updatedAt: appointmentData.updatedAt
        });
        
        // Process country-specific logic
        await processAppointmentUseCase.execute(appointment);
        
        // Save to MySQL database
        await mysqlAppointmentRepository.save(appointment);
        
        console.log(`Successfully processed ${COUNTRY_ISO} appointment ${appointment.id}`);
      } catch (error) {
        console.error(`Error processing ${COUNTRY_ISO} appointment:`, error);
        // In a production environment, we would implement proper error handling
        // For now, we'll rethrow to trigger SQS retry
        throw error;
      }
    }
    } catch (error) {
        console.error(`Critical error in ${COUNTRY_ISO} handler:`, error);
        throw error;
    }
  };