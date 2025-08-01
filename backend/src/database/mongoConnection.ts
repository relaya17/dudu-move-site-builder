import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/david-move';

export const connectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export const disconnectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
        console.error('❌ MongoDB disconnection error:', error);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectMongoDB();
    process.exit(0);
}); 