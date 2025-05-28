import { Appointment } from "../../domain/entities/appointment.entity"
import { AppointmentStatus } from "../../domain/entities/appointment.type"
import { AppointmentRepository } from "../../domain/ports/repositories/appointment.repository"
import { MessageBrokerService } from "../../domain/ports/services/message-broker.service"
import {
	CreateAppointmentRequest,
	CreateAppointmentResponse
} from "./use-case.type"
import { v4 as uuidv4 } from "uuid"

export class CreateAppointmentUseCase {
	constructor(
		private appointmentRepository: AppointmentRepository,
		private messageBrokerService: MessageBrokerService
	) {}

	async execute(
		request: CreateAppointmentRequest
	): Promise<CreateAppointmentResponse> {
		try {
			
            //  create a new appointment instance
			const appointment = new Appointment({
				id: uuidv4(),
				insuredId: request.insuredId,
				scheduleId: request.scheduleId,
				countryISO: request.countryISO,
				status: AppointmentStatus.PENDING
			})

			// Save the appointment to the database
			const savedAppointment = await this.appointmentRepository.save(
				appointment
			)

			// Publish to SNS for country-specific processing
			await this.messageBrokerService.publishAppointment(savedAppointment)

			return {
				id: savedAppointment.id!,
				status: "success",
				message: "Appointment scheduling is in progress"
			}
		} catch (error) {
			console.error("Error creating appointment:", error)
			throw error
		}
	}
}
