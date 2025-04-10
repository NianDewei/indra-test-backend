import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';

describe('Appointment Entity', () => {
  describe('constructor and validation', () => {
    it('should create a valid appointment with all required properties', () => {
      // Arrange
      const appointmentData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
      };

      // Act
      const appointment = new Appointment(appointmentData);

      // Assert
      expect(appointment).toBeDefined();
      expect(appointment.id).toBe(appointmentData.id);
      expect(appointment.insuredId).toBe(appointmentData.insuredId);
      expect(appointment.scheduleId).toBe(appointmentData.scheduleId);
      expect(appointment.countryISO).toBe(appointmentData.countryISO);
      expect(appointment.status).toBe(AppointmentStatus.PENDING);
      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });

    it('should create appointment with auto-generated timestamps if not provided', () => {
      // Arrange
      const before = new Date();
      
      // Act
      const appointment = new Appointment({
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
      });
      
      const after = new Date();
      const createdAt = new Date(appointment.createdAt);
      const updatedAt = new Date(appointment.updatedAt);

      // Assert
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw an error if insuredId is not 5 digits', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Appointment({
          insuredId: '123', // Invalid: not 5 digits
          scheduleId: 678,
          countryISO: 'PE',
          status: AppointmentStatus.PENDING,
        });
      }).toThrow('InsuredId must be a 5-digit string');
    });

    it('should throw an error if scheduleId is not a valid number', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Appointment({
          insuredId: '12345',
          scheduleId: 0, // Invalid: zero is not valid
          countryISO: 'PE',
          status: AppointmentStatus.PENDING,
        });
      }).toThrow('ScheduleId must be a valid number');
    });

    it('should throw an error if countryISO is invalid', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Appointment({
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'BR', // Invalid: only PE and CL are valid
          status: AppointmentStatus.PENDING,
        });
      }).toThrow('CountryISO must be either PE or CL');
    });
  });

  describe('status methods', () => {
    it('should mark appointment as completed', () => {
      // Arrange
      const appointment = new Appointment({
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
      });
      const originalUpdatedAt = appointment.updatedAt;
      
      // Wait a small amount to ensure timestamp will be different
      jest.advanceTimersByTime(100);

      // Act
      appointment.markAsCompleted(true); // Force test behavior

      // Assert
      expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
      expect(appointment.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should mark appointment as failed', () => {
      // Arrange
      const appointment = new Appointment({
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
      });
      const originalUpdatedAt = appointment.updatedAt;
      
      // Wait a small amount to ensure timestamp will be different
      jest.advanceTimersByTime(100);

      // Act
      appointment.markAsFailed(true); // Force test behavior

      // Assert
      expect(appointment.status).toBe(AppointmentStatus.FAILED);
      expect(appointment.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('toJSON method', () => {
    it('should return a properly formatted JSON object', () => {
      // Arrange
      const appointmentData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
        createdAt: '2025-04-09T10:00:00Z',
        updatedAt: '2025-04-09T10:00:00Z',
      };
      
      const appointment = new Appointment(appointmentData);

      // Act
      const json = appointment.toJSON();

      // Assert
      expect(json).toEqual(appointmentData);
    });
  });
});