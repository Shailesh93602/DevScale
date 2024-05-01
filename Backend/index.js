import { config } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const url = process.env.DB_URL;
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log("Server is listing on port: " + port);
});