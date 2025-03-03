import mongoose, { Document, Schema } from 'mongoose';

interface IParticipant {
    name: string;    // Name of the participant
    paid: boolean;   // Boolean to track if the user has paid
}

interface IEvent extends Document {
    title: string;
    organizer: string;
    location: string;
    date: Date;
    time: string;
    cost: number;
    maxParticipants: number;
    participants: IParticipant[]; // Array of participant objects with name, and paid status
    details: string;
    visibility: 'public' | 'invite-only';
    passcode?: string; // Passcode only for invite-only events
}

const eventSchema: Schema<IEvent> = new Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    cost: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    participants: {
        type: [{
            name: { type: String, required: true },
            paid: { type: Boolean, default: false }, // Default to false (not paid)
        }],
        default: [],
    },
    details: { type: String, default: "" },
    visibility: { type: String, enum: ['public', 'invite-only'], default: 'public', required: true },
    passcode: { type: String, default: null } // Only applies if visibility = 'invite-only'
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;