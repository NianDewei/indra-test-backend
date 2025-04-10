import { MySQLScheduleRepository } from "../../repositories/mysql-cscheldule.repository"
import { MySQLAppointmentRepository } from "../../repositories/mysql.appointment.repository"
import { EventBridgeService } from "../aws/event-bridge.service"

export class CountryServiceFactory {
	static createMySQLAppointmentRepository(
		countryISO: string
	): MySQLAppointmentRepository {
		return new MySQLAppointmentRepository()
	}

	static createMySQLScheduleRepository(
		countryISO: string
	): MySQLScheduleRepository {
		return new MySQLScheduleRepository()
	}

	static createEventBridgeService(): EventBridgeService {
		return new EventBridgeService()
	}
}
