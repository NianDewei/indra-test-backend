import { Appointment } from "../../domain/entities/appointment.entity"
import { AppointmentRepository } from "../../domain/ports/repositories/appointment.repository"

export class CompleteAppointmentUseCase {
	constructor(private appointmentRepository: AppointmentRepository) {}

	async execute(appointmentId: string): Promise<Appointment> {
		try {
			// Find the appointment
			const appointment = await this.appointmentRepository.findById(
				appointmentId
			)

			if (!appointment) {
				throw new Error(`Appointment with id ${appointmentId} not found`)
			}

			// Mark as completed
			appointment.markAsCompleted()

			// Update in DynamoDB
			return await this.appointmentRepository.update(appointment)
		} catch (error) {
			console.error("Error completing appointment:", error)
			throw error
		}
	}
}
