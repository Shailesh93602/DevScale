import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();
const url = process.env.DB_URL;
const client = new MongoClient(url);

export const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        return client.db('MrEngineers');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        throw error; 
    }
};

export const closeDatabaseConnection = async () => {
    try {
        await client.close();
        console.log('Connection to MongoDB Atlas closed');
    } catch (error) {
        console.error('Error closing MongoDB Atlas connection:', error);
        throw error; 
    }
};
