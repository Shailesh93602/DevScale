import { config } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const url = process.env.DB_URL;
const client = new MongoClient(url);

let usersCollection;

const connectToDatabase = async () => {
    try {
      await client.connect();
      const database = client.db('MrEngineers');
      usersCollection = database.collection('users');
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas:', error);
      process.exit(1);
    }
}
  connectToDatabase();
app.post('/auth/register', async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) res.status(300).json({ success: false, message: "Invalid payload"});
        let isUserExists = usersCollection.findOne({ email });
        if(isUserExists) res.status(500).json({ success: false, message: "User already exits!"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, password: hashedPassword };
        await usersCollection.insertOne(user);
        res.status(201).json({ success: true, message: "Registered Successfully!"});
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: error.message });
      }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Cannot find user'});
        if (await bcrypt.compare(password, user.password)) {
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
          res.status(200).json({ success: true, accessToken });
        } else res.status(401).json({ success: false, message: 'Incorrect username of password'});
      } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send();
      }
  });

app.listen(port, () => {
    console.log("Server is listing on port: " + port);
});