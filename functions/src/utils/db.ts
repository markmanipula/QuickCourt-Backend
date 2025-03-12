import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI; // Access the URI from environment variables
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables.');
        }
        await mongoose.connect(mongoURI); // No need for deprecated options
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process if the connection fails
    }
};

export default connectDB;