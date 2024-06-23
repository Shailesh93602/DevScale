import { config } from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routes from "./src/routes/routes.js";
import cors from "cors";
import { applyPassportStrategy } from "./src/middleware/passport.js";
import { v2 as cloudinary } from "cloudinary";

config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  console.log("Server is listening on port: " + port);
});
