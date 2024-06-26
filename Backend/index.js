import { config } from "dotenv";
import express from "express";
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
const port = process.env.PORT || 4000;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://localhost:3001"],
  })
);
app.use(routes);
applyPassportStrategy();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default app;
