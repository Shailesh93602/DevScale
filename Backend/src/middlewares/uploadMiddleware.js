import cloudinary from "../config/cloudinaryConfig.js";
import { Readable } from "stream";

const uploadMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);

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
