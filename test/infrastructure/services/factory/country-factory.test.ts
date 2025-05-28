import { CountryServiceFactory } from '../../../../src/appointments/infrastructure/ports/services/factory/country-factory.service';
import { MySQLAppointmentRepository } from '../../../../src/appointments/infrastructure/ports/repositories/mysql.appointment.repository';
import { MySQLScheduleRepository } from '../../../../src/appointments/infrastructure/ports/repositories/mysql-cscheldule.repository';
import { EventBridgeService } from '../../../../src/appointments/infrastructure/ports/services/aws/event-bridge.service';

// Mock dependencies
jest.mock('../../../../src/appointments/infrastructure/persistence/mysql-config', () => ({
  getDBConfig: jest.fn().mockImplementation((countryISO) => {
    if (countryISO === 'PE' || countryISO === 'CL') {
      return {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        database: `test-db-${countryISO.toLowerCase()}`,
        port: 3306
      };
    }
    throw new Error(`Invalid country ISO: ${countryISO}`);
  })
}));

describe('CountryServiceFactory Tests', () => {
  describe('createMySQLAppointmentRepository', () => {
    it('should create MySQL appointment repository for Peru', () => {
      const repo = CountryServiceFactory.createMySQLAppointmentRepository('PE');
      expect(repo).toBeInstanceOf(MySQLAppointmentRepository);
    });

    it('should create MySQL appointment repository for Chile', () => {
      const repo = CountryServiceFactory.createMySQLAppointmentRepository('CL');
      expect(repo).toBeInstanceOf(MySQLAppointmentRepository);
    });

    it('should throw error for unsupported country', () => {
      expect(() => {
        CountryServiceFactory.createMySQLAppointmentRepository('XX');
      }).toThrow('Unsupported country: XX');
    });
  });

  describe('createMySQLScheduleRepository', () => {
    it('should create MySQL schedule repository for Peru', () => {
      const repo = CountryServiceFactory.createMySQLScheduleRepository('PE');
      expect(repo).toBeInstanceOf(MySQLScheduleRepository);
    });

    it('should create MySQL schedule repository for Chile', () => {
      const repo = CountryServiceFactory.createMySQLScheduleRepository('CL');
      expect(repo).toBeInstanceOf(MySQLScheduleRepository);
    });

    it('should throw error for unsupported country', () => {
      expect(() => {
        CountryServiceFactory.createMySQLScheduleRepository('XX');
      }).toThrow('Unsupported country: XX');
    });
  });

  describe('createEventBridgeService', () => {
    it('should create EventBridge service for Peru', () => {
      const service = CountryServiceFactory.createEventBridgeService('PE');
      expect(service).toBeInstanceOf(EventBridgeService);
    });

    it('should create EventBridge service for Chile', () => {
      const service = CountryServiceFactory.createEventBridgeService('CL');
      expect(service).toBeInstanceOf(EventBridgeService);
    });

    it('should throw error for unsupported country', () => {
      expect(() => {
        CountryServiceFactory.createEventBridgeService('XX');
      }).toThrow('Unsupported country: XX');
    });
  });

  describe('getSupportedCountries', () => {
    it('should return array of supported countries', () => {
      const countries = CountryServiceFactory.getSupportedCountries();
      expect(countries).toEqual(['PE', 'CL']);
    });
  });

  describe('Factory Pattern Validation', () => {
    it('should properly validate country parameter is used', () => {
      // This test ensures the factory actually uses the countryISO parameter
      // instead of ignoring it (which was the original problem)
      
      // Create services for different countries
      const peRepo = CountryServiceFactory.createMySQLAppointmentRepository('PE');
      const clRepo = CountryServiceFactory.createMySQLAppointmentRepository('CL');
      
      // Both should be instances but potentially configured differently
      expect(peRepo).toBeInstanceOf(MySQLAppointmentRepository);
      expect(clRepo).toBeInstanceOf(MySQLAppointmentRepository);
      
      // The key improvement is that invalid countries now throw errors
      expect(() => {
        CountryServiceFactory.createMySQLAppointmentRepository('INVALID');
      }).toThrow('Unsupported country: INVALID');
    });
  });
});
