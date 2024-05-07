import multer from "multer";
import upload from "../helpers/fileUploads.js";

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res
      .status(500)
      .json({ error: "An error occurred while uploading the file." });
  }
  next();
};

export const uploadMiddleware = (req, res, next) => {
  upload.single("thumbnail")(req, res, function (err) {
    handleMulterError(err, req, res, next);
  });
};
