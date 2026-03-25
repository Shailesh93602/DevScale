import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from '../config';
import logger from './logger';
import { createAppError } from './errorHandler';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `mr_engineers/${folder}`,
    });
    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading file to Cloudinary', error);
    throw createAppError('Error uploading file to cloudinary', 500);
  }
};
