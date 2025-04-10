import { SQSEvent } from "aws-lambda"
import { ProcessCountryAppointmentUseCase } from "../../../application/uses-cases/proccess-country-appointment.use-case"
import { Appointment } from "../../../domain/entities/appointment.entity"
import { CountryServiceFactory } from "../../ports/services/factory/country-factory.service"

export const handler = async (event: SQSEvent): Promise<void> => {
	console.log("Processing CL appointments")

	// Initialize country-specific services using the factory pattern
	const scheduleRepository =
		CountryServiceFactory.createMySQLScheduleRepository("CL")
	const eventBusService = CountryServiceFactory.createEventBridgeService()
	const mysqlAppointmentRepository =
		CountryServiceFactory.createMySQLAppointmentRepository("CL")

	// Initialize use case
	const processAppointmentUseCase = new ProcessCountryAppointmentUseCase(
		scheduleRepository,
		eventBusService
	)

	// Process each message from the queue
	for (const record of event.Records) {
		try {
			// Parse the SQS message body
			const appointmentData = JSON.parse(record.body)

			// Create domain entity
			const appointment = new Appointment({
				id: appointmentData.id,
				insuredId: appointmentData.insuredId,
				scheduleId: appointmentData.scheduleId,
				countryISO: appointmentData.countryISO,
				status: appointmentData.status,
				createdAt: appointmentData.createdAt,
				updatedAt: appointmentData.updatedAt
			})

			// Process country-specific logic
			await processAppointmentUseCase.execute(appointment)

			// Save to MySQL database
			await mysqlAppointmentRepository.save(appointment)

			console.log(`Successfully processed CL appointment ${appointment.id}`)
		} catch (error) {
			console.error("Error processing CL appointment:", error)
			// In a production environment, we would implement proper error handling
			// For now, we'll rethrow to trigger SQS retry
			throw error
		}
	}
}
