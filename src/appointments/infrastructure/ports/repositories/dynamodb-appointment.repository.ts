import { DynamoDB } from "aws-sdk"

import { Appointment } from "../../../domain/entities/appointment.entity"
import { AppointmentStatus } from "../../../domain/entities/appointment.type"
import { AppointmentRepository } from "../../../domain/ports/repositories/appointment.repository"

export class DynamoDBAppointmentRepository implements AppointmentRepository {
	private readonly tableName: string
	private readonly dynamoDb: DynamoDB.DocumentClient

	constructor() {
		this.tableName = process.env.DYNAMODB_TABLE || ""
		this.dynamoDb = new DynamoDB.DocumentClient()
	}

	async save(appointment: Appointment): Promise<Appointment> {
		const params = {
			TableName: this.tableName,
			Item: appointment.toJSON()
		}

		await this.dynamoDb.put(params).promise()
		return appointment
	}

	async update(appointment: Appointment): Promise<Appointment> {
		const params = {
			TableName: this.tableName,
			Key: {
				id: appointment.id
			},
			UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
			ExpressionAttributeNames: {
				"#status": "status"
			},
			ExpressionAttributeValues: {
				":status": appointment.status,
				":updatedAt": appointment.updatedAt
			},
			ReturnValues: "ALL_NEW"
		}

		const result = await this.dynamoDb.update(params).promise()
		return this.mapToDomain(result.Attributes as Record<string, any>)
	}

	async findById(id: string): Promise<Appointment | null> {
		const params = {
			TableName: this.tableName,
			Key: {
				id
			}
		}

		const result = await this.dynamoDb.get(params).promise()

		if (!result.Item) {
			return null
		}

		return this.mapToDomain(result.Item)
	}

	async findByInsuredId(insuredId: string): Promise<Appointment[]> {
		const params = {
			TableName: this.tableName,
			IndexName: "insuredId-index",
			KeyConditionExpression: "insuredId = :insuredId",
			ExpressionAttributeValues: {
				":insuredId": insuredId
			}
		}

		const result = await this.dynamoDb.query(params).promise()

		return (result.Items || []).map((item) => this.mapToDomain(item))
	}

	private mapToDomain(item: Record<string, any>): Appointment {
		return new Appointment({
			id: item.id,
			insuredId: item.insuredId,
			scheduleId: item.scheduleId,
			countryISO: item.countryISO,
			status: item.status as AppointmentStatus,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		})
	}
}
