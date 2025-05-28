import { SNS } from "aws-sdk"
import { MessageBrokerService } from "../../../../domain/ports/services/message-broker.service"
import { Appointment } from "../../../../domain/entities/appointment.entity"
export class SNSService implements MessageBrokerService {
	private sns: SNS
	private topicArn: string

	constructor() {
		this.sns = new SNS()
		this.topicArn = process.env.SNS_TOPIC_ARN || ""
	}

	async publishAppointment(appointment: Appointment): Promise<void> {
		const params = {
			Message: JSON.stringify(appointment.toJSON()),
			TopicArn: this.topicArn,
			MessageAttributes: {
				countryISO: {
					DataType: "String",
					StringValue: appointment.countryISO
				}
			}
		}

		await this.sns.publish(params).promise()
	}

	async publishCompletedAppointment(appointment: Appointment): Promise<void> {
		// This is not used in the current flow but could be used for other notifications
		// For example, to notify the frontend that the appointment is completed
		const params = {
			Message: JSON.stringify({
				...appointment.toJSON(),
				status: "completed"
			}),
			TopicArn: this.topicArn
		}

		await this.sns.publish(params).promise()
	}
}
