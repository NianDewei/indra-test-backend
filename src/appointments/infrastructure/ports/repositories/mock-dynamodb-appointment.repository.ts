import { Appointment } from "../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/ports/repositories/appointment.repository";
import { AppointmentStatus } from "../../../domain/entities/appointment.type";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock implementation of DynamoDB repository using JSON file storage
 * Perfect for local development and testing
 */
export class MockDynamoDBAppointmentRepository implements AppointmentRepository {
    private readonly dataFilePath: string;

    constructor() {
        // Store data in project root
        this.dataFilePath = path.join(process.cwd(), 'mock-appointments-data.json');
        this.initializeDataFile();
    }

    private initializeDataFile(): void {
        if (!fs.existsSync(this.dataFilePath)) {
            fs.writeFileSync(this.dataFilePath, JSON.stringify([], null, 2));
            console.log(`📁 Mock DynamoDB data file created: ${this.dataFilePath}`);
        }
    }

    private readData(): Appointment[] {
        try {
            const data = fs.readFileSync(this.dataFilePath, 'utf8');
            const appointments = JSON.parse(data);
            return appointments.map((item: any) => new Appointment({
                id: item.id,
                insuredId: item.insuredId,
                scheduleId: item.scheduleId,
                countryISO: item.countryISO,
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
        } catch (error) {
            console.error('Error reading mock data:', error);
            return [];
        }
    }

    private writeData(appointments: Appointment[]): void {
        try {
            const data = appointments.map(appointment => appointment.toJSON());
            fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
            console.log(`💾 Mock data saved: ${appointments.length} appointments`);
        } catch (error) {
            console.error('Error writing mock data:', error);
            throw new Error('Failed to save appointment data');
        }
    }

    async save(appointment: Appointment): Promise<Appointment> {
        console.log(`💾 Saving appointment to mock storage:`, appointment.toJSON());
        
        const appointments = this.readData();
        
        // Generate ID if not provided
        if (!appointment.id) {
            appointment.id = uuidv4();
        }

        // Set default status if not provided
        if (!appointment.status) {
            appointment.status = AppointmentStatus.PENDING;
        }

        // Update timestamps
        const now = new Date().toISOString();
        appointment.createdAt = appointment.createdAt || now;
        appointment.updatedAt = now;

        // Add to array
        appointments.push(appointment);
        
        // Save to file
        this.writeData(appointments);
        
        console.log(`✅ Appointment saved successfully with ID: ${appointment.id}`);
        return appointment;
    }

    async update(appointment: Appointment): Promise<Appointment> {
        console.log(`🔄 Updating appointment in mock storage:`, appointment.id);
        
        const appointments = this.readData();
        const index = appointments.findIndex(a => a.id === appointment.id);
        
        if (index === -1) {
            throw new Error(`Appointment with id ${appointment.id} not found`);
        }

        // Update timestamp
        appointment.updatedAt = new Date().toISOString();
        
        // Replace in array
        appointments[index] = appointment;
        
        // Save to file
        this.writeData(appointments);
        
        console.log(`✅ Appointment updated successfully: ${appointment.id}`);
        return appointment;
    }

    async findById(id: string): Promise<Appointment | null> {
        console.log(`🔍 Finding appointment by ID in mock storage: ${id}`);
        
        const appointments = this.readData();
        const appointment = appointments.find(a => a.id === id);
        
        if (appointment) {
            console.log(`✅ Appointment found: ${id}`);
            return appointment;
        }
        
        console.log(`❌ Appointment not found: ${id}`);
        return null;
    }

    async findByInsuredId(insuredId: string): Promise<Appointment[]> {
        console.log(`🔍 Finding appointments by insuredId in mock storage: ${insuredId}`);
        
        const appointments = this.readData();
        const results = appointments.filter(a => a.insuredId === insuredId);
        
        console.log(`✅ Found ${results.length} appointments for insuredId: ${insuredId}`);
        return results;
    }

    // Utility method to view all data (for debugging)
    async getAllAppointments(): Promise<Appointment[]> {
        return this.readData();
    }

    // Utility method to clear all data (for testing)
    async clearAllData(): Promise<void> {
        fs.writeFileSync(this.dataFilePath, JSON.stringify([], null, 2));
        console.log('🗑️ All mock data cleared');
    }
}
