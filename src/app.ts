import express, { Request, Response } from 'express';
import eventRoutes from './routes/event.routes';
import connectDB from './utils/db';

const app = express();

app.use(express.json());  // To parse JSON bodies

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('QuickCourt Backend Running');
});

// Event Routes
app.use('/events', eventRoutes);

// MongoDB connection
connectDB();

// Start server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});