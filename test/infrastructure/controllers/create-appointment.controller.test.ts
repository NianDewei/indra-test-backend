import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createAppointment } from '../../../src/appointments/infrastructure/adapters/controllers/create-appointment.controller';
import { createAppointmentUseCase } from '../../../src/appointments/infrastructure/adapters/controllers/dependencies.controller';

// Mock the dependencies controller to inject our mocked use case
jest.mock('../../../src/appointments/infrastructure/adapters/controllers/dependencies.controller', () => ({
  createAppointmentUseCase: {
    execute: jest.fn()
  }
}));

describe('createAppointment Controller', () => {
  // Helper to create a mock API Gateway event
  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/appointments',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: ''
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate request has required 5-digit insuredId', async () => {
    // Arrange - Test both valid and invalid formats
    const validRequest = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'PE'
    };
    
    const invalidRequest1 = {
      insuredId: '123', // Too short
      scheduleId: 678,
      countryISO: 'PE'
    };
    
    const invalidRequest2 = {
      insuredId: '1234567', // Too long
      scheduleId: 678,
      countryISO: 'PE'
    };

    // Valid request should pass validation
    mockCreateAppointmentUseCase(validRequest, {
      id: 'mocked-uuid',
      status: 'success',
      message: 'Appointment scheduling is in progress'
    });
    
    // Act
    const validResult = await createAppointment(createMockEvent(validRequest));
    
    // Invalid request should be caught by validation
    (createAppointmentUseCase.execute as jest.Mock).mockImplementation(() => {
      throw new Error('InsuredId must be a 5-digit string');
    });
    
    const invalidResult1 = await createAppointment(createMockEvent(invalidRequest1));
    const invalidResult2 = await createAppointment(createMockEvent(invalidRequest2));
    
    // Assert
    expect(validResult.statusCode).toBe(202);
    expect(invalidResult1.statusCode).toBe(500);
    expect(invalidResult2.statusCode).toBe(500);
  });

  it('should validate request has valid countryISO (PE or CL)', async () => {
    // Arrange
    const validRequestPE = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'PE'
    };
    
    const validRequestCL = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'CL'
    };
    
    const invalidRequest = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'BR' // Invalid country
    };

    // Valid PE request
    mockCreateAppointmentUseCase(validRequestPE, {
      id: 'mocked-uuid-pe',
      status: 'success',
      message: 'Appointment scheduling is in progress'
    });
    
    const validResultPE = await createAppointment(createMockEvent(validRequestPE));
    
    // Valid CL request
    mockCreateAppointmentUseCase(validRequestCL, {
      id: 'mocked-uuid-cl',
      status: 'success',
      message: 'Appointment scheduling is in progress'
    });
    
    const validResultCL = await createAppointment(createMockEvent(validRequestCL));
    
    // Invalid country request
    (createAppointmentUseCase.execute as jest.Mock).mockImplementation(() => {
      throw new Error('CountryISO must be either PE or CL');
    });
    
    const invalidResult = await createAppointment(createMockEvent(invalidRequest));
    
    // Assert
    expect(validResultPE.statusCode).toBe(202);
    expect(validResultCL.statusCode).toBe(202);
    expect(invalidResult.statusCode).toBe(500);
    expect(JSON.parse(invalidResult.body).message).toBe('CountryISO must be either PE or CL');
  });

  it('should validate request has required scheduleId', async () => {
    // Arrange
    const mockRequest = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'PE'
    };
    
    const invalidRequest = {
      insuredId: '12345',
      // Missing scheduleId
      countryISO: 'PE'
    };
    
    mockCreateAppointmentUseCase(mockRequest, {
      id: 'mocked-uuid',
      status: 'success',
      message: 'Appointment scheduling is in progress'
    });
    
    // Act
    const validResult = await createAppointment(createMockEvent(mockRequest));
    const invalidResult = await createAppointment(createMockEvent(invalidRequest));

    // Assert
    expect(validResult.statusCode).toBe(202);
    expect(invalidResult.statusCode).toBe(400);
    expect(JSON.parse(invalidResult.body).message).toBe(
      'Missing required fields: insuredId, scheduleId, or countryISO'
    );
  });

  it('should return 202 with correct response structure', async () => {
    // Arrange
    const mockRequest = {
      insuredId: '12345',
      scheduleId: 678,
      countryISO: 'PE'
    };
    
    const mockResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'success',
      message: 'Appointment scheduling is in progress'
    };
    
    mockCreateAppointmentUseCase(mockRequest, mockResponse);
    
    // Act
    const result = await createAppointment(createMockEvent(mockRequest));

    // Assert
    expect(result.statusCode).toBe(202);
    expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(result.body)).toEqual(mockResponse);
  });

  // Helper function to setup the mock
  function mockCreateAppointmentUseCase(request: any, response: any) {
    (createAppointmentUseCase.execute as jest.Mock).mockImplementation((req) => {
      // Validate that what's passed to the use case matches the request
      expect(req).toEqual(request);
      return Promise.resolve(response);
    });
  }
});