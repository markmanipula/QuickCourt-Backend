import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    organizer: string;
    location: string;
    dateTime: Date;
    cost: number;
    maxParticipants: number;
    details: string;
    participants: { name: string; paid: boolean }[];
    waitlist: { name: string; paid: boolean }[];
    visibility: 'public' | 'invite-only';
    passcode?: string;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    location: { type: String, required: true },
    dateTime: { type: Date, required: true },
    cost: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    details: { type: String, required: true },
    participants: [{ name: String, paid: Boolean }],
    waitlist: [{ name: String, paid: Boolean }],
    visibility: { type: String, enum: ['public', 'invite-only'], default: 'public' },
    passcode: { type: String, required: false },
});

export default mongoose.model<IEvent>('Event', EventSchema);