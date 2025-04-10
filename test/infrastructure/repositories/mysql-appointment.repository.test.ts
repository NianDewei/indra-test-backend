import { MySQLAppointmentRepository } from '../../../src/appointments/infrastructure/ports/repositories/mysql.appointment.repository';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';
import * as mysql from 'mysql2/promise';

// Mock mysql2/promise module
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn()
}));

// Mock mysql-config
jest.mock('../../../src/appointments/infrastructure/persistence/mysql-config', () => ({
  getDBConfig: jest.fn().mockImplementation((countryISO) => {
    if (countryISO === 'PE') {
      return {
        host: 'db-pe-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-pe',
        port: 3306
      };
    } else {
      return {
        host: 'db-cl-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-cl',
        port: 3306
      };
    }
  })
}));

describe('MySQLAppointmentRepository', () => {
  let repository: MySQLAppointmentRepository;
  let mockConnection: any;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    mockExecute = jest.fn().mockResolvedValue([[], []]);
    mockConnection = {
      execute: mockExecute,
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
    
    repository = new MySQLAppointmentRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save appointment data to Peru MySQL database with correct format', async () => {
      // Arrange
      const appointmentPE = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
        createdAt: '2025-04-09T10:00:00Z',
        updatedAt: '2025-04-09T10:00:00Z'
      });

      // Act
      await repository.save(appointmentPE);

      // Assert
      // Verify correct connection was established for PE
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-pe-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-pe',
        port: 3306
      });

      // Verify the SQL query format and parameters
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO appointments (id, insured_id, schedule_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          '123e4567-e89b-12d3-a456-426614174000',
          '12345',
          678,
          'pending',
          '2025-04-09T10:00:00Z',
          '2025-04-09T10:00:00Z'
        ]
      );

      // Verify connection was closed
      expect(mockConnection.end).toHaveBeenCalled();
    });

    it('should save appointment data to Chile MySQL database with correct format', async () => {
      // Arrange
      const appointmentCL = new Appointment({
        id: '223e4567-e89b-12d3-a456-426614174001',
        insuredId: '54321',
        scheduleId: 679,
        countryISO: 'CL',
        status: AppointmentStatus.PENDING,
        createdAt: '2025-04-08T10:00:00Z',
        updatedAt: '2025-04-08T10:00:00Z'
      });

      // Act
      await repository.save(appointmentCL);

      // Assert
      // Verify correct connection was established for CL
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-cl-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-cl',
        port: 3306
      });

      // Verify the SQL query format and parameters
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO appointments (id, insured_id, schedule_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          '223e4567-e89b-12d3-a456-426614174001',
          '54321',
          679,
          'pending',
          '2025-04-08T10:00:00Z',
          '2025-04-08T10:00:00Z'
        ]
      );

      // Verify connection was closed
      expect(mockConnection.end).toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING
      });

      const dbError = new Error('Database connection failed');
      mockConnection.execute.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.save(appointment)).rejects.toThrow(dbError);
      expect(mockConnection.end).toHaveBeenCalled();
    });
  });
});