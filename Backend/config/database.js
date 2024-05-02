import { config } from 'dotenv';
import mongoose from 'mongoose';

config();
let isConnected = false;

export const connectToDatabase = async () => {
    mongoose.set('strictQuery', true);

    if(isConnected) {
        console.log("Mongo is already connected");
        return;
    }

    try {
        await mongoose.connect(process.env.DB_URL);

        isConnected = true;
        console.log("Mongo is connected");
    }
    catch(error) {
        console.log(error);
    }
}