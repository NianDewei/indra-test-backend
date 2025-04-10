import { Appointment } from "../../entities/appointment.entity"

export interface EventBusService {
	publishAppointmentCompleted(appointment: Appointment): Promise<void>
}
