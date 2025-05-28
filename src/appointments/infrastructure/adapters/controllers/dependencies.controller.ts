import { CompleteAppointmentUseCase } from "../../../application/uses-cases/complete-appointment.use-case"
import { CreateAppointmentUseCase } from "../../../application/uses-cases/create-appointment.use-case"
import { GetAppointmentsByInsuredIdUseCase } from "../../../application/uses-cases/get-appointment-insured-id.use-case"
import { DynamoDBAppointmentRepository } from "../../ports/repositories/dynamodb-appointment.repository"
import { MockDynamoDBAppointmentRepository } from "../../ports/repositories/mock-dynamodb-appointment.repository"
import { SNSService } from "../../ports/services/aws/sns.service"
import { MockSNSService } from "../../ports/services/aws/mock-sns.service"

// Check if we're running locally (serverless-offline)
const isLocal = process.env.IS_OFFLINE || process.env.NODE_ENV === "development"

// Initialize dependencies with mocks for local development
export const appointmentRepository = isLocal
	? new MockDynamoDBAppointmentRepository()
	: new DynamoDBAppointmentRepository()

export const messageBrokerService = isLocal
	? new MockSNSService()
	: new SNSService()

console.log(`🔧 Using ${isLocal ? "Mock" : "Real"} DynamoDB repository`)
console.log(`🔧 Using ${isLocal ? "Mock" : "Real"} SNS service`)

export const createAppointmentUseCase = new CreateAppointmentUseCase(
	appointmentRepository,
	messageBrokerService
)

export const getAppointmentsByInsuredIdUseCase =
	new GetAppointmentsByInsuredIdUseCase(appointmentRepository)

export const completeAppointmentUseCase = new CompleteAppointmentUseCase(
	appointmentRepository
)
