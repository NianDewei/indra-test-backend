import { Schedule } from "../../entities/schedule.entity"

export interface ScheduleRepository {
	findById(id: number, countryISO: string): Promise<Schedule | null>
	save(schedule: Schedule): Promise<Schedule>
}
