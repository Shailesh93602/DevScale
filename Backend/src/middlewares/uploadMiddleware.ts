import { NextFunction, Request, Response } from 'express';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';
import logger from '../utils/logger';

/**
 * Cloudinary upload middleware — streams req.file      * Must be preceded by: multer().single('field') → validateFileUpload()
 * validateFileUpload() enforces MIME whitelist (jpeg/png/webp) and 5 MB size cap.
 */
const uploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
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

    req.fileUrl = (result as { secure_url: string }).secure_url;
    next();
  } catch (error) {
    logger.error('Cloudinary upload failed', { error });
    res.status(500).json({ error: 'Failed to upload file to Cloudinary' });
    return;
  }
};

export default uploadMiddleware;
