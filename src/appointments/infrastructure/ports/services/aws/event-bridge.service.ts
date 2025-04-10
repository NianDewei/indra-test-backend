import { EventBridge } from "aws-sdk"
import { Appointment } from "../../../../domain/entities/appointment.entity"
import { EventBusService } from "../../../../domain/ports/services/event-bus.service"

export class EventBridgeService implements EventBusService {
	private eventBridge: EventBridge
	private eventBusName: string

	constructor() {
		this.eventBridge = new EventBridge()
		this.eventBusName = process.env.EVENT_BUS_NAME || ""
	}

	async publishAppointmentCompleted(appointment: Appointment): Promise<void> {
		const params = {
			Entries: [
				{
					Source: "medical-appointment",
					DetailType: "appointment.completed",
					Detail: JSON.stringify(appointment.toJSON()),
					EventBusName: this.eventBusName
				}
			]
		}

		await this.eventBridge.putEvents(params).promise()
	}
}
