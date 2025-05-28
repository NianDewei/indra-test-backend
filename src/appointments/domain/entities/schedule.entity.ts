export interface ScheduleProps {
    id: number;
    centerId: number;
    specialtyId: number;
    medicId: number;
    date: string;
    countryISO: string;
  }
  
  export class Schedule {
    id: number;
    centerId: number;
    specialtyId: number;
    medicId: number;
    date: string;
    countryISO: string;
  
    constructor(props: ScheduleProps) {
      this.id = props.id;
      this.centerId = props.centerId;
      this.specialtyId = props.specialtyId;
      this.medicId = props.medicId;
      this.date = props.date;
      this.countryISO = props.countryISO;
      
      this.validate();
    }
  
    validate(): void {
      if (!this.id || typeof this.id !== 'number') {
        throw new Error('Schedule ID must be a valid number');
      }
  
      if (!this.centerId || typeof this.centerId !== 'number') {
        throw new Error('Center ID must be a valid number');
      }
  
      if (!this.specialtyId || typeof this.specialtyId !== 'number') {
        throw new Error('Specialty ID must be a valid number');
      }
  
      if (!this.medicId || typeof this.medicId !== 'number') {
        throw new Error('Medic ID must be a valid number');
      }
  
      if (!this.date || isNaN(Date.parse(this.date))) {
        throw new Error('Date must be a valid ISO string date');
      }
  
      if (this.countryISO !== 'PE' && this.countryISO !== 'CL') {
        throw new Error('CountryISO must be either PE or CL');
      }
    }
  
    toJSON(): Record<string, any> {
      return {
        id: this.id,
        centerId: this.centerId,
        specialtyId: this.specialtyId,
        medicId: this.medicId,
        date: this.date,
        countryISO: this.countryISO
      };
    }
  }