import express, { Request, Response } from 'express';
import Event from '../models/event.model';

const router = express.Router();

// Create Event
router.post('/', async (req: Request, res: Response) => {
    const { title, location, date, cost, maxParticipants } = req.body;
    try {
        const newEvent = new Event({ title, location, date, cost, maxParticipants });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: 'Error creating event' });
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

export default router;