import cloudinary from "../config/cloudinaryConfig.js";
import multer from "multer";
import { Readable } from "stream";

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = upload.single("profilePicture");

const uploadMiddleware = async (req, res, next) => {
  try {
    // Ensure file is present in the request
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to stream
    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      stream.pipe(
        cloudinary.uploader.upload_stream((error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
      );
    });

    req.fileUrl = result.secure_url;
    next();
  } catch (error) {
    console.error("Error uploading image:", error);
    return res
      .status(500)
      .json({ error: "Failed to upload file to Cloudinary" });
  }
};

export default uploadMiddleware;
