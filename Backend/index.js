import { config } from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routes from "./src/routes/routes.js";
import { connectToDatabase } from "./config/database.js";
import cors from "cors";
import { applyPassportStrategy } from "./src/middleware/passport.js";

connectToDatabase();
config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://localhost:3001"],
  })
);
app.use(routes);
applyPassportStrategy();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is listing on port: " + port);
});
