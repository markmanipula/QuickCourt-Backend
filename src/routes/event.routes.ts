import express, { Request, Response } from 'express';
import Event from '../models/event.model';

const router = express.Router();

// Create Event
router.post('/', async (req: Request, res: Response) => {
    const { title, organizer, location, date, time, cost, maxParticipants, details, visibility } = req.body;
    try {
        const newEvent = new Event({
            title,
            organizer,
            location,
            date,
            time,
            cost,
            maxParticipants,
            details,
            participants: [organizer], // Initialize participants array with the organizer
            visibility: visibility || 'public', // Default to public if not provided
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: 'Error creating event' });
    }
});

// Join Event
// @ts-ignore
router.post('/:id/join', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { participant } = req.body;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.visibility === 'invite-only') {
            return res.status(403).json({ error: 'This event is invite-only. You cannot join without an invite.' });
        }

        if (event.participants.includes(participant)) {
            return res.status(400).json({ error: 'You are already a participant' });
        }

        if (event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ error: 'Event is full' });
        }

        event.participants.push(participant);
        await event.save();

        res.status(200).json({ message: 'Joined event successfully', event });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error joining event' });
    }
});

// Leave Event
// @ts-ignore
router.post('/:id/leave', async (req: Request, res: Response) => {
    const { id } = req.params; // Event ID
    const { participant } = req.body; // Participant info (e.g., user ID or name)

    try {
        // Find the event by ID
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!event.participants.includes(participant)) {
            return res.status(400).json({ error: 'You are not a participant in this event' });
        }

        // Remove the participant
        event.participants = event.participants.filter(p => p !== participant);
        await event.save();

        return res.status(200).json({ message: 'Left event successfully', event });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error leaving event' });
    }
});

// Get all Events
router.get('/', async (req: Request, res: Response) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching events' });
    }
});

// Get Event by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);
        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Error fetching event' });
    }
});

// Edit Event
// @ts-ignore
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, organizer, location, date, time, cost, maxParticipants, details, visibility } = req.body;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        event.title = title || event.title;
        event.organizer = organizer || event.organizer;
        event.location = location || event.location;
        event.date = date || event.date;
        event.time = time || event.time;
        event.cost = cost || event.cost;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.details = details || event.details;
        event.visibility = visibility || event.visibility; // Allow updating visibility

        await event.save();

        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating event' });
    }
});

// Delete Event
// @ts-ignore
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully', event });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error deleting event' });
    }
});

export default router;