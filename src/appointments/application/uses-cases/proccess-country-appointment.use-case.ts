import { Appointment } from "../../domain/entities/appointment.entity"
import { ScheduleRepository } from "../../domain/ports/repositories/schedule.repository"
import { EventBusService } from "../../domain/ports/services/event-bus.service"

export class ProcessCountryAppointmentUseCase {
	constructor(
		private scheduleRepository: ScheduleRepository,
		private eventBusService: EventBusService
	) {}

	async execute(appointment: Appointment): Promise<void> {
		try {
			// Here we would implement country-specific logic
			// For now, we'll just simulate the processing

			// 1. Validate the schedule exists
			const schedule = await this.scheduleRepository.findById(
				appointment.scheduleId,
				appointment.countryISO
			)

			if (!schedule) {
				throw new Error(`Schedule with id ${appointment.scheduleId} not found`)
			}

			// 2. Process the appointment (country-specific)
			// This is where we would add the specific logic for each country
			console.log(
				`Processing appointment for country: ${appointment.countryISO}`
			)

			// 3. Save to country-specific MySQL database
			// Assume this is handled by the infrastructure layer

			// 4. Publish completion event to EventBridge
			await this.eventBusService.publishAppointmentCompleted(appointment)
		} catch (error) {
			console.error(
				`Error processing ${appointment.countryISO} appointment:`,
				error
			)
			throw error
		}
	}
}
