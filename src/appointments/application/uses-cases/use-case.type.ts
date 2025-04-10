export interface CreateAppointmentRequest {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
  }
  
  export interface CreateAppointmentResponse {
    id: string;
    status: string;
    message: string;
  }