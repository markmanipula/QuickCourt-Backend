import * as functions from 'firebase-functions';
import express from 'express';
import connectDB from './utils/db'; // Import the connectDB function
import eventRoutes from './event.routes';
import 'dotenv/config'; // For TypeScript/ES modules

const app = express();

// Connect to MongoDB
connectDB();

// Use your event routes
app.use('/events', eventRoutes);

// Export the API as a Firebase Cloud Function
export const api = functions.https.onRequest(app);