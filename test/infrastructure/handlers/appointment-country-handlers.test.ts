import { SQSEvent } from 'aws-lambda';
import { handler as appointmentPEHandler } from '../../../src/appointments/infrastructure/adapters/handlers/appointment_pe';
import { handler as appointmentCLHandler } from '../../../src/appointments/infrastructure/adapters/handlers/appointment_cl';
import { ProcessCountryAppointmentUseCase } from '../../../src/appointments/application/uses-cases/proccess-country-appointment.use-case';
import { CountryServiceFactory } from '../../../src/appointments/infrastructure/ports/services/factory/country-factory.service';

// Mock the factory to avoid real services creation
jest.mock('../../../src/appointments/infrastructure/ports/services/factory/country-factory.service', () => ({
  CountryServiceFactory: {
    createMySQLScheduleRepository: jest.fn(),
    createMySQLAppointmentRepository: jest.fn(),
    createEventBridgeService: jest.fn()
  }
}));

// Mock ProcessCountryAppointmentUseCase
jest.mock('../../../src/appointments/application/uses-cases/proccess-country-appointment.use-case');

describe('Country-specific Lambda Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('appointment_pe handler', () => {
    it('should process PE appointments with correct country code', async () => {
      // Arrange
      const mockScheduleRepo = { findById: jest.fn(), save: jest.fn() };
      const mockEventBus = { publishAppointmentCompleted: jest.fn() };
      const mockAppointmentRepo = { save: jest.fn() };
      
      (CountryServiceFactory.createMySQLScheduleRepository as jest.Mock)
        .mockReturnValue(mockScheduleRepo);
      (CountryServiceFactory.createEventBridgeService as jest.Mock)
        .mockReturnValue(mockEventBus);
      (CountryServiceFactory.createMySQLAppointmentRepository as jest.Mock)
        .mockReturnValue(mockAppointmentRepo);
        
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      (ProcessCountryAppointmentUseCase as jest.Mock).mockImplementation(() => ({
        execute: mockExecute
      }));

      const mockEvent: SQSEvent = {
        Records: [
          {
            body: JSON.stringify({
              id: '123e4567-e89b-12d3-a456-426614174000',
              insuredId: '12345',
              scheduleId: 678,
              countryISO: 'PE',
              status: 'pending'
            }),
            messageId: '1',
            receiptHandle: 'handle',
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: '',
            eventSource: '',
            eventSourceARN: '',
            awsRegion: ''
          }
        ]
      };

      // Act
      await appointmentPEHandler(mockEvent);

      // Assert
      // Verify that the right country code was used to create repositories
      expect(CountryServiceFactory.createMySQLScheduleRepository).toHaveBeenCalledWith('PE');
      expect(CountryServiceFactory.createMySQLAppointmentRepository).toHaveBeenCalledWith('PE');
      
      // Verify that the use case was called with correct data
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123e4567-e89b-12d3-a456-426614174000',
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'PE'
        })
      );
      
      // Verify data was saved to country database
      expect(mockAppointmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123e4567-e89b-12d3-a456-426614174000',
          countryISO: 'PE'
        })
      );
    });
  });

  describe('appointment_cl handler', () => {
    it('should process CL appointments with correct country code', async () => {
      // Arrange
      const mockScheduleRepo = { findById: jest.fn(), save: jest.fn() };
      const mockEventBus = { publishAppointmentCompleted: jest.fn() };
      const mockAppointmentRepo = { save: jest.fn() };
      
      (CountryServiceFactory.createMySQLScheduleRepository as jest.Mock)
        .mockReturnValue(mockScheduleRepo);
      (CountryServiceFactory.createEventBridgeService as jest.Mock)
        .mockReturnValue(mockEventBus);
      (CountryServiceFactory.createMySQLAppointmentRepository as jest.Mock)
        .mockReturnValue(mockAppointmentRepo);
      
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      (ProcessCountryAppointmentUseCase as jest.Mock).mockImplementation(() => ({
        execute: mockExecute
      }));

      const mockEvent: SQSEvent = {
        Records: [
          {
            body: JSON.stringify({
              id: '223e4567-e89b-12d3-a456-426614174001',
              insuredId: '12345',
              scheduleId: 679,
              countryISO: 'CL',
              status: 'pending'
            }),
            messageId: '1',
            receiptHandle: 'handle',
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: '',
            eventSource: '',
            eventSourceARN: '',
            awsRegion: ''
          }
        ]
      };

      // Act
      await appointmentCLHandler(mockEvent);

      // Assert
      // Verify that the right country code was used to create repositories
      expect(CountryServiceFactory.createMySQLScheduleRepository).toHaveBeenCalledWith('CL');
      expect(CountryServiceFactory.createMySQLAppointmentRepository).toHaveBeenCalledWith('CL');
      
      // Verify that the use case was called with correct data
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '223e4567-e89b-12d3-a456-426614174001',
          insuredId: '12345',
          scheduleId: 679,
          countryISO: 'CL'
        })
      );
      
      // Verify data was saved to country database
      expect(mockAppointmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '223e4567-e89b-12d3-a456-426614174001',
          countryISO: 'CL'
        })
      );
    });
  });
});
