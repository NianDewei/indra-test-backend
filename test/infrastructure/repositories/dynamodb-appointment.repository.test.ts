import { DynamoDBAppointmentRepository } from '../../../src/appointments/infrastructure/ports/repositories/dynamodb-appointment.repository';
import { Appointment } from '../../../src/appointments/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../src/appointments/domain/entities/appointment.type';
import { DynamoDB } from 'aws-sdk';

// Mock AWS SDK - ensuring no actual connections happen
jest.mock('aws-sdk', () => {
  const mockDocumentClient = {
    put: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient)
    }
  };
});

describe('DynamoDBAppointmentRepository', () => {
  let repository: DynamoDBAppointmentRepository;
  let mockDocumentClient: any;
  
  beforeEach(() => {
    process.env.DYNAMODB_TABLE = 'test-appointments-table';
    
    mockDocumentClient = new DynamoDB.DocumentClient();
    repository = new DynamoDBAppointmentRepository();
    
    // Ensure promise resolves immediately to prevent any hanging
    mockDocumentClient.promise.mockImplementation(() => Promise.resolve({}));
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.DYNAMODB_TABLE;
  });
  
  describe('save', () => {
    it('should correctly format appointment data for DynamoDB', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.PENDING,
        createdAt: '2025-04-09T10:00:00Z',
        updatedAt: '2025-04-09T10:00:00Z'
      });
      
      // Act
      await repository.save(appointment);
      
      // Assert - only check the formatting is correct, not the actual save
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'test-appointments-table',
        Item: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'PE',
          status: 'pending',
          createdAt: '2025-04-09T10:00:00Z',
          updatedAt: '2025-04-09T10:00:00Z'
        }
      });
    });
  });
  
  describe('update', () => {
    it('should correctly format update parameters for DynamoDB', async () => {
      // Arrange
      const appointment = new Appointment({
        id: '123e4567-e89b-12d3-a456-426614174000',
        insuredId: '12345',
        scheduleId: 678,
        countryISO: 'PE',
        status: AppointmentStatus.COMPLETED,
        createdAt: '2025-04-09T10:00:00Z',
        updatedAt: '2025-04-09T11:30:00Z'
      });
      
      // Mock immediate response to prevent hanging
      mockDocumentClient.promise.mockResolvedValueOnce({
        Attributes: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'PE',
          status: 'completed',
          createdAt: '2025-04-09T10:00:00Z',
          updatedAt: '2025-04-09T11:30:00Z'
        }
      });
      
      // Act
      const result = await repository.update(appointment);
      
      // Assert - validate the format of the update command
      expect(mockDocumentClient.update).toHaveBeenCalledWith({
        TableName: 'test-appointments-table',
        Key: {
          id: '123e4567-e89b-12d3-a456-426614174000'
        },
        UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'completed',
          ':updatedAt': '2025-04-09T11:30:00Z'
        },
        ReturnValues: 'ALL_NEW'
      });
      
      // Verify response mapping is correct
      expect(result).toBeInstanceOf(Appointment);
      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });
  });
  
  describe('findById', () => {
    it('should correctly map DynamoDB response to an Appointment entity', async () => {
      // Arrange
      const appointmentId = '123e4567-e89b-12d3-a456-426614174000';
      
      // Mock immediate response to prevent hanging
      mockDocumentClient.promise.mockResolvedValueOnce({
        Item: {
          id: appointmentId,
          insuredId: '12345',
          scheduleId: 678,
          countryISO: 'PE',
          status: 'pending',
          createdAt: '2025-04-09T10:00:00Z',
          updatedAt: '2025-04-09T10:00:00Z'
        }
      });
      
      // Act
      const result = await repository.findById(appointmentId);
      
      // Assert - validate query format
      expect(mockDocumentClient.get).toHaveBeenCalledWith({
        TableName: 'test-appointments-table',
        Key: { id: appointmentId }
      });
      
      // Verify response mapping is correct
      expect(result).toBeInstanceOf(Appointment);
      expect(result?.status).toBe(AppointmentStatus.PENDING);
    });
    
    it('should return null when appointment is not found', async () => {
      // Arrange
      const appointmentId = 'non-existent-id';
      
      // Mock immediate response with no item to prevent hanging
      mockDocumentClient.promise.mockResolvedValueOnce({
        Item: null
      });
      
      // Act
      const result = await repository.findById(appointmentId);
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('findByInsuredId', () => {
    it('should correctly map multiple DynamoDB items to Appointment entities', async () => {
      // Arrange
      const insuredId = '12345';
      
      // Mock immediate response with multiple items to prevent hanging
      mockDocumentClient.promise.mockResolvedValueOnce({
        Items: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            insuredId: '12345',
            scheduleId: 678,
            countryISO: 'PE',
            status: 'pending',
            createdAt: '2025-04-09T10:00:00Z',
            updatedAt: '2025-04-09T10:00:00Z'
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            insuredId: '12345',
            scheduleId: 679,
            countryISO: 'CL',
            status: 'completed',
            createdAt: '2025-04-08T10:00:00Z',
            updatedAt: '2025-04-08T11:30:00Z'
          }
        ]
      });
      
      // Act
      const results = await repository.findByInsuredId(insuredId);
      
      // Assert - validate query format
      expect(mockDocumentClient.query).toHaveBeenCalledWith({
        TableName: 'test-appointments-table',
        IndexName: 'insuredId-index',
        KeyConditionExpression: 'insuredId = :insuredId',
        ExpressionAttributeValues: { ':insuredId': insuredId }
      });
      
      // Verify results mapping is correct
      expect(results.length).toBe(2);
      
      // First appointment
      expect(results[0]).toBeInstanceOf(Appointment);
      expect(results[0].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(results[0].countryISO).toBe('PE');
      expect(results[0].status).toBe(AppointmentStatus.PENDING);
      
      // Second appointment
      expect(results[1]).toBeInstanceOf(Appointment);
      expect(results[1].id).toBe('223e4567-e89b-12d3-a456-426614174001');
      expect(results[1].countryISO).toBe('CL');
      expect(results[1].status).toBe(AppointmentStatus.COMPLETED);
    });
    
    it('should return empty array when no appointments exist for insuredId', async () => {
      // Arrange
      const insuredId = '99999';
      
      // Mock immediate response with empty array to prevent hanging
      mockDocumentClient.promise.mockResolvedValueOnce({
        Items: []
      });
      
      // Act
      const results = await repository.findByInsuredId(insuredId);
      
      // Assert
      expect(results).toEqual([]);
    });
  });
});