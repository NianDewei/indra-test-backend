import { createConnection, Connection } from 'mysql2/promise';
import { ScheduleRepository } from "../../../domain/ports/repositories/schedule.repository";
import { Schedule } from '../../../domain/entities/schedule.entity';
import { getDBConfig } from '../../persistence/mysql-config';

export class MySQLScheduleRepository implements ScheduleRepository {
    private getConnection(countryISO: string): Promise<Connection> {
      // Get connection details based on country
      const config = getDBConfig(countryISO);
      return createConnection(config);
    }
  
    async findById(id: number, countryISO: string): Promise<Schedule | null> {
      const connection = await this.getConnection(countryISO);
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM schedules WHERE id = ?',
          [id]
        );
        
        await connection.end();
        
        const scheduleData = (rows as any[])[0];
        if (!scheduleData) {
          return null;
        }
        
        return new Schedule({
          id: scheduleData.id,
          centerId: scheduleData.center_id,
          specialtyId: scheduleData.specialty_id,
          medicId: scheduleData.medic_id,
          date: scheduleData.date,
          countryISO
        });
      } catch (error) {
        await connection.end();
        throw error;
      }
    }
  
    async save(schedule: Schedule): Promise<Schedule> {
      const connection = await this.getConnection(schedule.countryISO);
      
      try {
        // Insert schedule into country-specific database
        await connection.execute(
          'INSERT INTO schedules (id, center_id, specialty_id, medic_id, date) VALUES (?, ?, ?, ?, ?)',
          [
            schedule.id,
            schedule.centerId,
            schedule.specialtyId,
            schedule.medicId,
            schedule.date
          ]
        );
        
        await connection.end();
        return schedule;
      } catch (error) {
        await connection.end();
        throw error;
      }
    }
  }