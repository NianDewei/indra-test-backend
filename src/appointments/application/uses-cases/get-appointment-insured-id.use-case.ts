import { Appointment } from "../../domain/entities/appointment.entity"
import { AppointmentRepository } from "../../domain/ports/repositories/appointment.repository"

export class GetAppointmentsByInsuredIdUseCase {
	constructor(private appointmentRepository: AppointmentRepository) {}

	async execute(insuredId: string): Promise<Appointment[]> {
		try {
			return await this.appointmentRepository.findByInsuredId(insuredId)
		} catch (error) {
			console.error("Error getting appointments by insuredId:", error)
			throw error
		}
	}
}
