import express, { Request, Response } from 'express';
import Event from './models/event.model';

const router = express.Router();

/**
 * Utility function to generate a 4-digit passcode
 */
const generatePasscode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit number
};

// Create Event
router.post('/', async (req: Request, res: Response) => {
    const { title, organizer, location, dateTime, cost, maxParticipants, details, visibility } = req.body;

    try {
        const newEvent = new Event({
            title,
            organizer,
            location,
            dateTime, // Expecting the full DateTime object now
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

        // Check if the event is full
        if (event.participants.length >= event.maxParticipants) {
            // Add participant to the waitlist if event is full
            if (event.waitlist.some(w => w.name === participant)) {
                return res.status(400).json({ error: 'You are already on the waitlist' });
            }

            event.waitlist.push({ name: participant, paid: false });
            await event.save();
            return res.status(200).json({ message: 'Event is full, added to waitlist', event });
        }

        // Add the new participant directly to participants if there is space
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
    const { title, organizer, location, dateTime, cost, maxParticipants, details, visibility } = req.body;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const previousMaxParticipants = event.maxParticipants;

        // Update properties if provided
        if (visibility === 'invite-only' && event.visibility === 'public') {
            event.passcode = generatePasscode();
        } else if (visibility === 'public' && event.visibility === 'invite-only') {
            event.passcode = undefined;
        }

        event.title = title || event.title;
        event.organizer = organizer || event.organizer;
        event.location = location || event.location;
        event.dateTime = dateTime || event.dateTime; // Updated here
        event.cost = cost || event.cost;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.details = details || event.details;
        event.visibility = visibility || event.visibility;

        // Handle automatic movement from waitlist
        if (maxParticipants > previousMaxParticipants) {
            const availableSpots = maxParticipants - event.participants.length;
            if (availableSpots > 0 && event.waitlist.length > 0) {
                const toMove = event.waitlist.splice(0, availableSpots); // Take up to available spots
                event.participants.push(...toMove); // Move from waitlist to participants
            }
        }

        await event.save();

        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating event' });
    }
});

// Toggle Paid Status for a Participant
// @ts-ignore
router.put('/:id/participants/:participantName/toggle-paid', async (req: Request, res: Response) => {
    const { id, participantName } = req.params;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Find the participant
        const participant = event.participants.find(p => p.name === participantName);
        if (!participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        // Toggle the 'paid' status
        participant.paid = !participant.paid;

        await event.save();

        return res.status(200).json({ message: `Participant's payment status updated to ${participant.paid ? 'Paid' : 'Not Paid'}`, event });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error toggling payment status' });
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

        // Check if the participant is in the event participants
        const participantIndex = event.participants.findIndex(p => p.name === participant);
        if (participantIndex === -1) {
            // If not a participant, check if on waitlist
            const waitlistIndex = event.waitlist.findIndex(w => w.name === participant);
            if (waitlistIndex !== -1) { // Found in the waitlist
                // Remove from waitlist
                event.waitlist.splice(waitlistIndex, 1);
                await event.save();
                return res.status(200).json({ message: 'Left waitlist successfully', event });
            }
            // If is neither a participant nor on waitlist
            return res.status(400).json({ error: 'You are not a participant or waitlisted for this event' });
        }

        // Remove the participant from participants
        event.participants.splice(participantIndex, 1);

        // Promote the first attendee from the waitlist if available
        if (event.waitlist.length > 0) {
            const nextInLine = event.waitlist.shift(); // Get the first person in the waitlist
            if (nextInLine) { // Ensure nextInLine is defined
                event.participants.push(nextInLine); // Move them to participants
            }
        }

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