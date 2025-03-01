import mongoose, { Document, Schema } from 'mongoose';

interface IEvent extends Document {
    title: string;
    organizer: string;
    location: string;
    date: Date;
    time: string;
    cost: number;
    maxParticipants: number;
    participants: string[]; // Array of userIds
    details: string;
    visibility: 'public' | 'invite-only'; // New field for event visibility
}

const eventSchema: Schema<IEvent> = new Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    cost: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    participants: { type: [String], default: [] },
    details: { type: String, default: "" },
    visibility: { type: String, enum: ['public', 'invite-only'], default: 'public', required: true } // Added field
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;