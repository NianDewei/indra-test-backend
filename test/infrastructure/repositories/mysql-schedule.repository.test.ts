import { MySQLScheduleRepository } from '../../../src/appointments/infrastructure/ports/repositories/mysql-cscheldule.repository';
import { Schedule } from '../../../src/appointments/domain/entities/schedule.entity';
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

describe('MySQLScheduleRepository', () => {
  let repository: MySQLScheduleRepository;
  let mockConnection: any;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    // Mock connection functions
    mockExecute = jest.fn();
    mockConnection = {
      execute: mockExecute,
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);
    
    repository = new MySQLScheduleRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find and map schedule from Peru database correctly', async () => {
      // Arrange
      const scheduleId = 678;
      const countryISO = 'PE';
      
      // Mock database response for Peru schedule
      const mockScheduleRow = {
        id: 678,
        center_id: 4,
        specialty_id: 3,
        medic_id: 4,
        date: '2024-09-30T12:30:00Z'
      };
      
      mockExecute.mockResolvedValue([[mockScheduleRow], []]);
      
      // Act
      const result = await repository.findById(scheduleId, countryISO);
      
      // Assert
      // Verify correct connection was established
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-pe-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-pe',
        port: 3306
      });
      
      // Verify the correct SQL query was executed
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM schedules WHERE id = ?',
        [678]
      );
      
      // Verify result was correctly mapped to domain entity
      expect(result).toBeInstanceOf(Schedule);
      expect(result?.id).toBe(678);
      expect(result?.centerId).toBe(4);
      expect(result?.specialtyId).toBe(3);
      expect(result?.medicId).toBe(4);
      expect(result?.date).toBe('2024-09-30T12:30:00Z');
      expect(result?.countryISO).toBe('PE');
      
      // Verify connection was closed
      expect(mockConnection.end).toHaveBeenCalled();
    });
    
    it('should find and map schedule from Chile database correctly', async () => {
      // Arrange
      const scheduleId = 679;
      const countryISO = 'CL';
      
      // Mock database response for Chile schedule
      const mockScheduleRow = {
        id: 679,
        center_id: 5,
        specialty_id: 4,
        medic_id: 5,
        date: '2024-10-01T14:00:00Z'
      };
      
      mockExecute.mockResolvedValue([[mockScheduleRow], []]);
      
      // Act
      const result = await repository.findById(scheduleId, countryISO);
      
      // Assert
      // Verify correct connection was established
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-cl-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-cl',
        port: 3306
      });
      
      // Verify the correct SQL query was executed
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM schedules WHERE id = ?',
        [679]
      );
      
      // Verify result was correctly mapped to domain entity
      expect(result).toBeInstanceOf(Schedule);
      expect(result?.id).toBe(679);
      expect(result?.centerId).toBe(5);
      expect(result?.specialtyId).toBe(4);
      expect(result?.medicId).toBe(5);
      expect(result?.date).toBe('2024-10-01T14:00:00Z');
      expect(result?.countryISO).toBe('CL');
      
      // Verify connection was closed
      expect(mockConnection.end).toHaveBeenCalled();
    });
    
    it('should return null when schedule is not found', async () => {
      // Arrange
      const scheduleId = 999; // Non-existent ID
      const countryISO = 'PE';
      
      mockExecute.mockResolvedValue([[], []]); // Empty result
      
      // Act
      const result = await repository.findById(scheduleId, countryISO);
      
      // Assert
      expect(result).toBeNull();
      expect(mockConnection.end).toHaveBeenCalled();
    });
    
    it('should propagate database errors', async () => {
      // Arrange
      const scheduleId = 678;
      const countryISO = 'PE';
      const dbError = new Error('Database connection failed');
      
      mockExecute.mockRejectedValue(dbError);
      
      // Act & Assert
      await expect(repository.findById(scheduleId, countryISO)).rejects.toThrow(dbError);
      expect(mockConnection.end).toHaveBeenCalled();
    });
  });
  
  describe('save', () => {
    it('should save schedule data to Peru MySQL database with correct format', async () => {
      // Arrange
      const schedulePE = new Schedule({
        id: 678,
        centerId: 4,
        specialtyId: 3,
        medicId: 4,
        date: '2024-09-30T12:30:00Z',
        countryISO: 'PE'
      });
      
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, undefined]);
      
      // Act
      const result = await repository.save(schedulePE);
      
      // Assert
      // Verify correct connection was established
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-pe-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-pe',
        port: 3306
      });
      
      // Verify SQL query format and parameters
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO schedules (id, center_id, specialty_id, medic_id, date) VALUES (?, ?, ?, ?, ?)',
        [678, 4, 3, 4, '2024-09-30T12:30:00Z']
      );
      
      // Verify connection was closed and original schedule was returned
      expect(mockConnection.end).toHaveBeenCalled();
      expect(result).toEqual(schedulePE);
    });
    
    it('should save schedule data to Chile MySQL database with correct format', async () => {
      // Arrange
      const scheduleCL = new Schedule({
        id: 679,
        centerId: 5,
        specialtyId: 4,
        medicId: 5,
        date: '2024-10-01T14:00:00Z',
        countryISO: 'CL'
      });
      
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, undefined]);
      
      // Act
      const result = await repository.save(scheduleCL);
      
      // Assert
      // Verify correct connection was established
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'db-cl-test',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db-cl',
        port: 3306
      });
      
      // Verify SQL query format and parameters
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO schedules (id, center_id, specialty_id, medic_id, date) VALUES (?, ?, ?, ?, ?)',
        [679, 5, 4, 5, '2024-10-01T14:00:00Z']
      );
      
      // Verify connection was closed and original schedule was returned
      expect(mockConnection.end).toHaveBeenCalled();
      expect(result).toEqual(scheduleCL);
    });
  });
});