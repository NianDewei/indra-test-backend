import { ProcessCountryAppointmentUseCase } from '../../../src/appointments/application/uses-cases/proccess-country-appointment.use-case';
import { ScheduleRepository } from '../../../src/appointments/domain/ports/repositories/schedule.repository';
import { EventBusService } from '../../../src/appointments/domain/ports/services/event-bus.service';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';
import { Schedule } from '../../../src/appointments/domain/entities/schedule.entity';

describe('ProcessCountryAppointmentUseCase', () => {
  let processCountryAppointmentUseCase: ProcessCountryAppointmentUseCase;
  let mockScheduleRepository: jest.Mocked<ScheduleRepository>;
  let mockEventBusService: jest.Mocked<EventBusService>;

  beforeEach(() => {
    mockScheduleRepository = {
      findById: jest.fn(),
      save: jest.fn()
    };

    mockEventBusService = {
      publishAppointmentCompleted: jest.fn()
    };

    processCountryAppointmentUseCase = new ProcessCountryAppointmentUseCase(
      mockScheduleRepository,
      mockEventBusService
    );
  });

  describe('execute', () => {
    it('should process PE appointment correctly', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING
      });

      const schedule = new Schedule({
        id: 678,
        centerId: 4,
        specialtyId: 3,
        medicId: 4,
        date: '2024-09-30T12:30:00Z',
        countryISO: 'PE'
      });

      mockScheduleRepository.findById.mockResolvedValue(schedule);

      // Act
      await processCountryAppointmentUseCase.execute(appointment);

      // Assert
      // Verify schedule lookup was performed with correct parameters
      expect(mockScheduleRepository.findById).toHaveBeenCalledWith(678, 'PE');
      
      // Verify event was published after processing
      expect(mockEventBusService.publishAppointmentCompleted).toHaveBeenCalledWith(appointment);
    });

    it('should process CL appointment correctly', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 679,
        countryISO: 'CL',
        status: AppointmentStatus.PENDING
      });

      const schedule = new Schedule({
        id: 679,
        centerId: 5,
        specialtyId: 4,
        medicId: 5,
        date: '2024-10-01T14:00:00Z',
        countryISO: 'CL'
      });

      mockScheduleRepository.findById.mockResolvedValue(schedule);

      // Act
      await processCountryAppointmentUseCase.execute(appointment);

      // Assert
      // Verify schedule lookup was performed with correct parameters  
      expect(mockScheduleRepository.findById).toHaveBeenCalledWith(679, 'CL');
      
      // Verify event was published after processing
      expect(mockEventBusService.publishAppointmentCompleted).toHaveBeenCalledWith(appointment);
    });

    it('should throw error if schedule does not exist', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 999, // Non-existent schedule
        countryISO: 'PE',
        status: AppointmentStatus.PENDING
      });

      mockScheduleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(processCountryAppointmentUseCase.execute(appointment)).rejects.toThrow(
        `Schedule with id ${appointment.scheduleId} not found`
      );
      expect(mockEventBusService.publishAppointmentCompleted).not.toHaveBeenCalled();
    });
  });
});
