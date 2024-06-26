import cloudinary from "../config/cloudinaryConfig.js";

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.body.profilePicture) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.body.profilePicture);
    req.fileUrl = result.secure_url;
    next();
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ error: "Failed to upload file to Cloudinary" });
  }
};

export default uploadToCloudinary;
