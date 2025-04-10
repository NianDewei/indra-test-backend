import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { createAppointment } from "../controllers/create-appointment.controller"
import { getAppointmentsByInsuredId } from "../controllers/get-appointment-by-insure-id.controller"

// Handle API Gateway events
export async function handleAPIGatewayEvent(
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
	const { httpMethod, path, pathParameters } = event

	// POST /appointments - Create a new appointment
	if (httpMethod === "POST" && path === "/appointments") {
		return await createAppointment(event)
	}

	// GET /appointments/{insuredId} - Get appointments by insuredId
	if (httpMethod === "GET" && path.match(/\/appointments\/[^/]+$/)) {
		return await getAppointmentsByInsuredId(pathParameters?.insuredId || "")
	}

	// Return 404 for unmatched routes with reference to API docs
	return {
		statusCode: 404,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ 
			error: "Not Found",
			message: "The requested endpoint does not exist. Please refer to the API documentation at /swagger."
		})
	}
}
