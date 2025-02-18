import Event from '../models/event.model';
import { Request, Response } from 'express';

// Create Event
export const createEvent = async (req: Request, res: Response): Promise<Response> => {
    console.log("Received event data:", req.body); // Log the data received from frontend

    const { eventName, address, date, time, members, details } = req.body;

    // Validation for required fields
    if (!eventName || !address || !date || !time || !members) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that members is a number
    if (typeof members !== 'number' || members <= 0 || !Number.isInteger(members)) {
        return res.status(400).json({ message: "Members must be a positive integer" });
    }

    // Optional: Validate date and time format (simple check)
    if (isNaN(Date.parse(date))) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    if (isNaN(Date.parse(time))) {
        return res.status(400).json({ message: "Invalid time format" });
    }

    try {
        const newEvent = new Event({
            eventName,
            address,
            date,
            time,
            members,
            details,
        });

        await newEvent.save();
        console.log("Event created:", newEvent); // Log the created event

        return res.status(201).json(newEvent); // Return the created event as a response
    } catch (error) {
        console.error("Error creating event:", error); // Log any error that occurs during event creation
        return res.status(500).json({ message: "Failed to create event" });
    }
};

// Get all Events
export const getAllEvents = async (req: Request, res: Response): Promise<Response> => {
    try {
        const events = await Event.find();
        return res.status(200).json(events); // Return all events in response
    } catch (error) {
        console.error("Error fetching events:", error); // Log the error
        return res.status(500).json({ error: 'Error fetching events' });
    }
};

// Get Event by ID
export const getEventById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const event = await Event.findById(id);
        if (event) {
            return res.status(200).json(event); // Return event if found
        } else {
            return res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error("Error fetching event:", error); // Log the error
        return res.status(500).json({ error: 'Error fetching event' });
    }
};