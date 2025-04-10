import { DBConfig } from "./mysq-config.type"

export function getDBConfig(countryISO: string): DBConfig {

	const envsMySQLPE = JSON.parse(String(process.env.MYSQL_ENV_PE))
	const envsMySQLCL = JSON.parse(String(process.env.MYSQL_ENV_CL))

	if (countryISO === "PE") {
		return {
			host: envsMySQLPE.host,
			user: envsMySQLPE.user,
			password: envsMySQLPE.password,
			database: envsMySQLPE.database,
			port: parseInt(envsMySQLPE.port)
		}
	}
	
	if (countryISO === "CL") {
		return {
			host: envsMySQLCL.host,
			user: envsMySQLCL.user,
			password: envsMySQLCL.password,
			database: envsMySQLCL.database,
			port: parseInt(envsMySQLCL.port)
		}
	}

	throw new Error(`Invalid country ISO: ${countryISO}`)
}
