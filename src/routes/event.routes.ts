import express, { Request, Response } from 'express';
import Event from '../models/event.model';

const router = express.Router();

/**
 * Utility function to generate a 4-digit passcode
 */
const generatePasscode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit number
};

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
            participants: [{ name: organizer, paid: false }], // Initialize participants array with the organizer
            visibility: visibility || 'public',
            passcode: visibility === 'invite-only' ? generatePasscode() : undefined // Generate passcode if invite-only
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: 'Error creating event' });
    }
});

// Join Event (With Passcode for Invite-Only Events)
// @ts-ignore
router.post('/:id/join', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { participant, passcode } = req.body; // Expecting participant's name and optional passcode
    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.visibility === 'invite-only' && passcode !== event.passcode) {
            return res.status(403).json({ error: 'Invalid passcode' });
        }

        // Check if participant already exists
        if (event.participants.some(p => p.name === participant)) {
            return res.status(400).json({ error: 'You are already a participant' });
        }

        if (event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ error: 'Event is full' });
        }

        // Add the new participant
        event.participants.push({ name: participant, paid: false });
        await event.save();

        res.status(200).json({ message: 'Joined event successfully', event });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error joining event' });
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

        // Update properties if provided
        if (visibility === 'invite-only' && event.visibility === 'public') {
            event.passcode = generatePasscode();
        }
        if (visibility === 'public' && event.visibility === 'invite-only') {
            event.passcode = undefined;
        }

        event.title = title || event.title;
        event.organizer = organizer || event.organizer;
        event.location = location || event.location;
        event.date = date || event.date;
        event.time = time || event.time;
        event.cost = cost || event.cost;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.details = details || event.details;
        event.visibility = visibility || event.visibility;

        await event.save();

        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating event' });
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

// Leave Event
// @ts-ignore
router.post('/:id/leave', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { participant } = req.body;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if the participant is in the event
        const participantIndex = event.participants.findIndex(p => p.name === participant);
        if (participantIndex === -1) {
            return res.status(400).json({ error: 'You are not a participant in this event' });
        }

        // Remove the participant
        event.participants.splice(participantIndex, 1);
        await event.save();

        return res.status(200).json({ message: 'Left event successfully', event });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error leaving event' });
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