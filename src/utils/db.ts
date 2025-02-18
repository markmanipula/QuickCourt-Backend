import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/quickcourt');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process if DB connection fails
    }
};

export default connectDB;