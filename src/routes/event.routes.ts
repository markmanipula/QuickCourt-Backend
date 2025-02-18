import express from 'express';
import { createEvent, getAllEvents, getEventById } from '../controllers/event.controller';

const router = express.Router();

// Create Event
router.post('/', createEvent);

// Get all Events
router.get('/', getAllEvents);

// Get Event by ID
router.get('/:id', getEventById);

export default router;