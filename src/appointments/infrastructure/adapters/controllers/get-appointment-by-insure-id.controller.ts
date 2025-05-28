import { APIGatewayProxyResult } from "aws-lambda"
import { getAppointmentsByInsuredIdUseCase } from "./dependencies.controller"

export async function getAppointmentsByInsuredId(
	insuredId: string
): Promise<APIGatewayProxyResult> {
	try {
		// Validate insuredId format
		if (!insuredId || insuredId.length !== 5) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					error: "Bad Request",
					message: "InsuredId must be a 5-digit string"
				})
			}
		}

		// Get appointments
		const appointments = await getAppointmentsByInsuredIdUseCase.execute(
			insuredId
		)

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				count: appointments.length,
				items: appointments.map((a) => a.toJSON())
			})
		}
	} catch (error) {
		console.error(
			`Error getting appointments for insuredId ${insuredId}:`,
			error
		)

		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				error: "Internal Server Error",
				message: (error as Error).message
			})
		}
	}
}
