import { CompleteAppointmentUseCase } from "../../../application/uses-cases/complete-appointment.use-case"
import { CreateAppointmentUseCase } from "../../../application/uses-cases/create-appointment.use-case"
import { GetAppointmentsByInsuredIdUseCase } from "../../../application/uses-cases/get-appointment-insured-id.use-case"
import { DynamoDBAppointmentRepository } from "../../ports/repositories/dynamodb-appointment.repository"
import { SNSService } from "../../ports/services/aws/sns.service"

// Initialize dependencies
export const appointmentRepository = new DynamoDBAppointmentRepository()
export const messageBrokerService = new SNSService()
export const createAppointmentUseCase = new CreateAppointmentUseCase(
	appointmentRepository,
	messageBrokerService
)

export const getAppointmentsByInsuredIdUseCase =
	new GetAppointmentsByInsuredIdUseCase(appointmentRepository)

export const completeAppointmentUseCase = new CompleteAppointmentUseCase(
	appointmentRepository
)
