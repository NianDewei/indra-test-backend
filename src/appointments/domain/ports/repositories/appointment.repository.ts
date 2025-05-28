import { Appointment } from "../../entities/appointment.entity"

export interface AppointmentRepository {
	save(appointment: Appointment): Promise<Appointment>
	update(appointment: Appointment): Promise<Appointment>
	findById(id: string): Promise<Appointment | null>
	findByInsuredId(insuredId: string): Promise<Appointment[]>
}
