export interface AppointmentProps {
    id?: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export enum AppointmentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
  }