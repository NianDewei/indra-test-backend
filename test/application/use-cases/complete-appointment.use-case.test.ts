import { CompleteAppointmentUseCase } from '../../../src/appointments/application/uses-cases/complete-appointment.use-case';
import { AppointmentRepository } from '../../../src/appointments/domain/ports/repositories/appointment.repository';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';

describe('CompleteAppointmentUseCase', () => {
  let completeAppointmentUseCase: CompleteAppointmentUseCase;
  let appointmentRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    appointmentRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn()
    };

    completeAppointmentUseCase = new CompleteAppointmentUseCase(
      appointmentRepository
    );
  });

  describe('execute', () => {
    it('should update appointment status from pending to completed', async () => {
      // Arrange
      const appointmentId = '123e4567-e89b-12d3-a456-426614174000';
      const initialTimestamp = '2025-04-10T04:40:39.034Z';
      
      // Initial appointment with PENDING status
      const pendingAppointment = new Appointment({
        id: appointmentId,
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
        createdAt: '2025-04-09T10:00:00Z',
        updatedAt: initialTimestamp
      });
      
      // Store the original updatedAt value to compare later
      const originalUpdatedAt = pendingAppointment.updatedAt;
      
      // Mock the appointment retrieval
      appointmentRepository.findById.mockResolvedValue(pendingAppointment);
      
      // Mock update to simulate what CompleteAppointmentUseCase would do
      appointmentRepository.update.mockImplementation((appointment) => {
        // Simplemente retorna el appointment que fue pasado (debería tener status COMPLETED)
        return Promise.resolve(appointment);
      });
      
      // Act
      const result = await completeAppointmentUseCase.execute(appointmentId);
      
      // Assert
      expect(appointmentRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(appointmentRepository.update).toHaveBeenCalled();
      expect(result.status).toBe(AppointmentStatus.COMPLETED);
      expect(result.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should throw error if appointment does not exist', async () => {
      // Arrange
      const appointmentId = 'non-existent-id';
      appointmentRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(completeAppointmentUseCase.execute(appointmentId)).rejects.toThrow(
        `Appointment with id ${appointmentId} not found`
      );
      expect(appointmentRepository.update).not.toHaveBeenCalled();
    });
  });
});
