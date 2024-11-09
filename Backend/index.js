import { config } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./src/routes/routes.js";
import cors from "cors";
import { applyPassportStrategy } from "./src/middlewares/passport.js";
import { v2 as cloudinary } from "cloudinary";
// import mongoose from "mongoose";
import db from "./db/models/index.js";

config(); // Ensure environment variables are loaded early

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(routes);
applyPassportStrategy();

const startServer = async () => {
  try {
    await db.sequelize.authenticate();

    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("Stack trace:", error.stack);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  try {
    await db.sequelize.close();
    await mongoose.connection.close();
    console.log("Closed database connections.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();

export default app;
