import { GetAppointmentsByInsuredIdUseCase } from '../../../src/appointments/application/uses-cases/get-appointment-insured-id.use-case';
import { AppointmentRepository } from '../../../src/appointments/domain/ports/repositories/appointment.repository';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';

describe('GetAppointmentsByInsuredIdUseCase', () => {
  let getAppointmentsByInsuredIdUseCase: GetAppointmentsByInsuredIdUseCase;
  let appointmentRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    // Create mock for repository
    appointmentRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn()
    };

    // Initialize use case with mock
    getAppointmentsByInsuredIdUseCase = new GetAppointmentsByInsuredIdUseCase(
      appointmentRepository
    );
  });

  describe('execute', () => {
    it('should return appointments for a valid insuredId', async () => {
      // Arrange
      const insuredId = '12345';
      const mockAppointments = [
        new Appointment({
          id: '123e4567-e89b-12d3-a456-426614174000',
          insuredId,
          scheduleId: 678,
          countryISO: 'PE',
          status: AppointmentStatus.PENDING,
          createdAt: '2025-04-09T10:00:00Z',
          updatedAt: '2025-04-09T10:00:00Z'
        }),
        new Appointment({
          id: '223e4567-e89b-12d3-a456-426614174001',
          insuredId,
          scheduleId: 679,
          countryISO: 'CL',
          status: AppointmentStatus.COMPLETED,
          createdAt: '2025-04-08T10:00:00Z',
          updatedAt: '2025-04-08T11:30:00Z'
        })
      ];

      appointmentRepository.findByInsuredId.mockResolvedValue(mockAppointments);

      // Act
      const result = await getAppointmentsByInsuredIdUseCase.execute(insuredId);

      // Assert
      expect(appointmentRepository.findByInsuredId).toHaveBeenCalledWith(insuredId);
      expect(result).toEqual(mockAppointments);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no appointments exist for insuredId', async () => {
      // Arrange
      const insuredId = '12345';
      appointmentRepository.findByInsuredId.mockResolvedValue([]);

      // Act
      const result = await getAppointmentsByInsuredIdUseCase.execute(insuredId);

      // Assert
      expect(appointmentRepository.findByInsuredId).toHaveBeenCalledWith(insuredId);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const insuredId = '12345';
      const expectedError = new Error('Database connection error');
      appointmentRepository.findByInsuredId.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(getAppointmentsByInsuredIdUseCase.execute(insuredId)).rejects.toThrow(expectedError);
      expect(appointmentRepository.findByInsuredId).toHaveBeenCalledWith(insuredId);
    });
  });
});