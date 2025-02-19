import mongoose, { Document, Schema } from 'mongoose';

interface IEvent extends Document {
    title: string;
    organizer: string;
    location: string;
    date: Date;
    cost: number;
    maxParticipants: number;
    participants: string[]; // Array of userIds,
    details: string;
}

const eventSchema: Schema<IEvent> = new Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    cost: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    participants: { type: [String], default: [] },
    details: { type: String, default: "" },

});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;