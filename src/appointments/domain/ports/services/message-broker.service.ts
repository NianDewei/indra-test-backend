import { Appointment } from "../../entities/appointment.entity";

export interface MessageBrokerService {
    publishAppointment(appointment: Appointment): Promise<void>;
    publishCompletedAppointment(appointment: Appointment): Promise<void>;
  }