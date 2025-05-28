import { APIGatewayProxyResult } from 'aws-lambda';
import { getAppointmentsByInsuredId } from '../../../src/appointments/infrastructure/adapters/controllers/get-appointment-by-insure-id.controller';
import { getAppointmentsByInsuredIdUseCase } from '../../../src/appointments/infrastructure/adapters/controllers/dependencies.controller';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';

// Mock the dependencies controller to inject our mocked use case
jest.mock('../../../src/appointments/infrastructure/adapters/controllers/dependencies.controller', () => ({
  getAppointmentsByInsuredIdUseCase: {
    execute: jest.fn()
  }
}));

describe('getAppointmentsByInsuredId Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with appointments when found', async () => {
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

    (getAppointmentsByInsuredIdUseCase.execute as jest.Mock).mockResolvedValue(mockAppointments);

    // Act
    const result: APIGatewayProxyResult = await getAppointmentsByInsuredId(insuredId);

    // Assert
    expect(getAppointmentsByInsuredIdUseCase.execute).toHaveBeenCalledWith(insuredId);
    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
    
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.count).toBe(2);
    expect(parsedBody.items).toHaveLength(2);
    expect(parsedBody.items[0].id).toBe(mockAppointments[0].id);
    expect(parsedBody.items[0].insuredId).toBe(insuredId);
    expect(parsedBody.items[1].id).toBe(mockAppointments[1].id);
  });

  it('should return 200 with empty array when no appointments found', async () => {
    // Arrange
    const insuredId = '12345';
    (getAppointmentsByInsuredIdUseCase.execute as jest.Mock).mockResolvedValue([]);

    // Act
    const result: APIGatewayProxyResult = await getAppointmentsByInsuredId(insuredId);

    // Assert
    expect(getAppointmentsByInsuredIdUseCase.execute).toHaveBeenCalledWith(insuredId);
    expect(result.statusCode).toBe(200);
    
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.count).toBe(0);
    expect(parsedBody.items).toHaveLength(0);
  });

  it('should return 400 when insuredId is invalid format', async () => {
    // Arrange
    const invalidInsuredId = '123'; // Not 5 digits
    
    // Act
    const result: APIGatewayProxyResult = await getAppointmentsByInsuredId(invalidInsuredId);

    // Assert
    expect(getAppointmentsByInsuredIdUseCase.execute).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Bad Request',
      message: 'InsuredId must be a 5-digit string'
    });
  });

  it('should return 400 when insuredId is missing', async () => {
    // Arrange
    const emptyInsuredId = '';
    
    // Act
    const result: APIGatewayProxyResult = await getAppointmentsByInsuredId(emptyInsuredId);

    // Assert
    expect(getAppointmentsByInsuredIdUseCase.execute).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Bad Request',
      message: 'InsuredId must be a 5-digit string'
    });
  });

  it('should return 500 when use case execution fails', async () => {
    // Arrange
    const insuredId = '12345';
    const error = new Error('Database error');
    (getAppointmentsByInsuredIdUseCase.execute as jest.Mock).mockRejectedValue(error);

    // Act
    const result: APIGatewayProxyResult = await getAppointmentsByInsuredId(insuredId);

    // Assert
    expect(getAppointmentsByInsuredIdUseCase.execute).toHaveBeenCalledWith(insuredId);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Internal Server Error',
      message: 'Database error'
    });
  });
});