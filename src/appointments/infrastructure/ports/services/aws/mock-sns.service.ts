import { MessageBrokerService } from "../../../../domain/ports/services/message-broker.service";
import { Appointment } from "../../../../domain/entities/appointment.entity";

/**
 * Mock implementation of SNS service for local development
 * Simulates message publishing without requiring AWS infrastructure
 */
export class MockSNSService implements MessageBrokerService {
    private messages: Array<{ type: string; appointment: Appointment; timestamp: string }> = [];

    async publishAppointment(appointment: Appointment): Promise<void> {
        const timestamp = new Date().toISOString();
        
        console.log(`📤 Mock SNS: Publishing appointment created`);
        console.log(`📄 Appointment:`, appointment.toJSON());
        
        // Store message in memory for debugging
        this.messages.push({
            type: 'appointment_created',
            appointment,
            timestamp
        });
        
        console.log(`✅ Mock SNS: Appointment published successfully`);
        console.log(`📊 Total messages published: ${this.messages.length}`);
    }

    async publishCompletedAppointment(appointment: Appointment): Promise<void> {
        const timestamp = new Date().toISOString();
        
        console.log(`📤 Mock SNS: Publishing appointment completed`);
        console.log(`📄 Appointment:`, appointment.toJSON());
        
        // Store message in memory for debugging
        this.messages.push({
            type: 'appointment_completed',
            appointment,
            timestamp
        });
        
        console.log(`✅ Mock SNS: Completed appointment published successfully`);
        console.log(`📊 Total messages published: ${this.messages.length}`);
    }

    // Utility method to view published messages (for debugging)
    getPublishedMessages(): Array<{ type: string; appointment: Appointment; timestamp: string }> {
        return [...this.messages];
    }

    // Utility method to clear message history (for testing)
    clearMessages(): void {
        this.messages = [];
        console.log('🗑️ Mock SNS: Message history cleared');
    }
}
