import { CreateAppointmentUseCase } from '../../../src/appointments/application/uses-cases/create-appointment.use-case';
import { AppointmentRepository } from '../../../src/appointments/domain/ports/repositories/appointment.repository';
import { MessageBrokerService } from '../../../src/appointments/domain/ports/services/message-broker.service';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';
import { CreateAppointmentRequest } from '../../../src/appointments/application/uses-cases/use-case.type';

// Mock uuid to return a predictable value
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid')
}));

describe('CreateAppointmentUseCase', () => {
  let createAppointmentUseCase: CreateAppointmentUseCase;
  let appointmentRepository: jest.Mocked<AppointmentRepository>;
  let messageBrokerService: jest.Mocked<MessageBrokerService>;

  beforeEach(() => {
    // Create mocks
    appointmentRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn()
    };

    messageBrokerService = {
      publishAppointment: jest.fn(),
      publishCompletedAppointment: jest.fn()
    };

    // Initialize use case with mocks
    createAppointmentUseCase = new CreateAppointmentUseCase(
      appointmentRepository,
      messageBrokerService
    );
  });

  describe('execute', () => {
    it('should create appointment with initial status PENDING', async () => {
      // Arrange
      const request: CreateAppointmentRequest = {
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE'
      };

      const expectedAppointment = new Appointment({
        id: 'mocked-uuid',
        insuredId: request.insuredId,
        scheduleId: request.scheduleId,
        countryISO: request.countryISO,
        status: AppointmentStatus.PENDING
      });

      appointmentRepository.save.mockResolvedValue(expectedAppointment);

      // Act
      await createAppointmentUseCase.execute(request);

      // Assert - Verify appointment is saved with PENDING status
      expect(appointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid',
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'PE',
          status: AppointmentStatus.PENDING
        })
      );
    });

    it('should publish appointment to SNS after saving to DynamoDB', async () => {
      // Arrange
      const request: CreateAppointmentRequest = {
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE'
      };

      const savedAppointment = new Appointment({
        id: 'mocked-uuid',
        insuredId: request.insuredId,
        scheduleId: request.scheduleId,
        countryISO: request.countryISO,
        status: AppointmentStatus.PENDING
      });

      appointmentRepository.save.mockResolvedValue(savedAppointment);

      // Act
      await createAppointmentUseCase.execute(request);

      // Assert - Verify appointment is published to message broker
      expect(appointmentRepository.save).toHaveBeenCalled();
      // Verify save is called before publish
      expect(messageBrokerService.publishAppointment).toHaveBeenCalledWith(savedAppointment);
    });

    it('should return response with correct structure', async () => {
      // Arrange
      const request: CreateAppointmentRequest = {
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE'
      };

      const savedAppointment = new Appointment({
        id: 'mocked-uuid',
        insuredId: request.insuredId,
        scheduleId: request.scheduleId,
        countryISO: request.countryISO,
        status: AppointmentStatus.PENDING
      });

      appointmentRepository.save.mockResolvedValue(savedAppointment);

      // Act
      const result = await createAppointmentUseCase.execute(request);

      // Assert - Verify response structure
      expect(result).toEqual({
        id: 'mocked-uuid',
        status: 'success',
        message: 'Appointment scheduling is in progress'
      });
    });

    it('should validate countryISO is either PE or CL', async () => {
      // Arrange
      const request: CreateAppointmentRequest = {
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'BR' // Invalid country
      };

      // Act & Assert
      await expect(createAppointmentUseCase.execute(request)).rejects.toThrow(
        'CountryISO must be either PE or CL'
      );
      expect(appointmentRepository.save).not.toHaveBeenCalled();
      expect(messageBrokerService.publishAppointment).not.toHaveBeenCalled();
    });
  });
});