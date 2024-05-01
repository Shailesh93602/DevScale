import { config } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import routes from './src/routes/routes.js';

config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is listing on port: " + port);
});