import { createConnection, Connection } from "mysql2/promise"
import { Appointment } from "../../../domain/entities/appointment.entity"
import { getDBConfig } from "../../persistence/mysql-config"

export class MySQLAppointmentRepository {
	private getConnection(countryISO: string): Promise<Connection> {
		// Get connection details based on country
		const config = getDBConfig(countryISO)
		return createConnection(config)
	}

	async save(appointment: Appointment): Promise<void> {
		const connection = await this.getConnection(appointment.countryISO)

		try {
			// Insert appointment into country-specific database
			await connection.execute(
				"INSERT INTO appointments (id, insured_id, schedule_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
				[
					appointment.id,
					appointment.insuredId,
					appointment.scheduleId,
					appointment.status,
					appointment.createdAt,
					appointment.updatedAt
				]
			)

			await connection.end()
		} catch (error) {
			await connection.end()
			throw error
		}
	}
}
