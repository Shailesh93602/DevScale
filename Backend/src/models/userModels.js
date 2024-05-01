import { connectToDatabase } from '../../config/database.js';

let usersCollection;

export const initializeUsersCollection = async () => {
    try {
        const database = await connectToDatabase();
        usersCollection = database.collection('users');
    } catch (error) {
        console.error('Error initializing users collection:', error);
        throw error; 
    }
};

export const getUsersCollection = () => {
    if (!usersCollection) {
        throw new Error('Users collection not initialized');
    }
    return usersCollection;
};
