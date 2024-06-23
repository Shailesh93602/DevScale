import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";

const upload = multer({ dest: "uploads/" });

const uploadToCloudinary = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Failed to upload file" });
    }

    try {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      req.fileUrl = result.secure_url;
      next();
    } catch (error) {
      console.error("Error uploading image:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload file to Cloudinary" });
    }
  });
};

export default uploadToCloudinary;
