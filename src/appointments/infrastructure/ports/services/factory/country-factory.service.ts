import { MySQLScheduleRepository } from "../../repositories/mysql-cscheldule.repository"
import { MySQLAppointmentRepository } from "../../repositories/mysql.appointment.repository"
import { EventBridgeService } from "../aws/event-bridge.service"
import { getDBConfig } from "../../../persistence/mysql-config"

/**
 * Factory pattern implementation to create country-specific services
 * This factory validates the country and ensures proper service configuration
 */
export class CountryServiceFactory {
	private static readonly SUPPORTED_COUNTRIES = ['PE', 'CL']

	/**
	 * Creates a MySQL appointment repository for the specified country
	 * @param countryISO - The ISO code of the country (PE, CL)
	 * @returns MySQLAppointmentRepository instance
	 * @throws Error if country is not supported
	 */
	static createMySQLAppointmentRepository(
		countryISO: string
	): MySQLAppointmentRepository {
		this.validateCountry(countryISO)
		// Validate that database configuration exists for this country
		getDBConfig(countryISO) // This will throw if country is invalid
		return new MySQLAppointmentRepository()
	}

	/**
	 * Creates a MySQL schedule repository for the specified country
	 * @param countryISO - The ISO code of the country (PE, CL)
	 * @returns MySQLScheduleRepository instance
	 * @throws Error if country is not supported
	 */
	static createMySQLScheduleRepository(
		countryISO: string
	): MySQLScheduleRepository {
		this.validateCountry(countryISO)
		// Validate that database configuration exists for this country
		getDBConfig(countryISO) // This will throw if country is invalid
		return new MySQLScheduleRepository()
	}

	/**
	 * Creates an EventBridge service
	 * @param countryISO - Optional country ISO for country-specific configuration
	 * @returns EventBridgeService instance
	 */
	static createEventBridgeService(countryISO?: string): EventBridgeService {
		if (countryISO) {
			this.validateCountry(countryISO)
		}
		return new EventBridgeService()
	}

	/**
	 * Validates if the provided country ISO is supported
	 * @param countryISO - The country ISO to validate
	 * @throws Error if country is not supported
	 */
	private static validateCountry(countryISO: string): void {
		if (!this.SUPPORTED_COUNTRIES.includes(countryISO)) {
			throw new Error(`Unsupported country: ${countryISO}. Supported countries: ${this.SUPPORTED_COUNTRIES.join(', ')}`)
		}
	}

	/**
	 * Gets the list of supported countries
	 * @returns Array of supported country ISO codes
	 */
	static getSupportedCountries(): string[] {
		return [...this.SUPPORTED_COUNTRIES]
	}
}
