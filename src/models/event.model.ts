import mongoose, { Document, Schema } from 'mongoose';

interface IParticipant {
    name: string; // Name of the participant
    paid: boolean; // Boolean to track if the user has paid
}

// Define the participant schema separately
const participantSchema: Schema = new Schema({
    name: { type: String, required: true },
    paid: { type: Boolean, default: false }, // Default to false (not paid)
});

// Extend the Document interface for Event
interface IEvent extends Document {
    title: string;
    organizer: string;
    location: string;
    dateTime: Date; // Changed from separate date and time fields to a single dateTime field
    cost: number;
    maxParticipants: number;
    participants: IParticipant[]; // Array of participant objects with name, and paid status
    waitlist: IParticipant[]; // Array for waitlisted participants
    details: string;
    visibility: 'public' | 'invite-only';
    passcode?: string; // Passcode only for invite-only events
}

const eventSchema: Schema<IEvent> = new Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    location: { type: String, required: true },
    dateTime: { type: Date, required: true }, // Use single dateTime field
    cost: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    participants: {
        type: [participantSchema], // Use the defined participant schema
        default: [],
    },
    waitlist: {
        type: [participantSchema], // Use the defined participant schema
        default: [],
    },
    details: { type: String, default: "" },
    visibility: { type: String, enum: ['public', 'invite-only'], default: 'public', required: true },
    passcode: { type: String, default: null }, // Only applies if visibility = 'invite-only'
});

// Register the model
const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;