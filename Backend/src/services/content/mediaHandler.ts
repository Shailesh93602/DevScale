import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import logger from '../../utils/logger';
import sharp from 'sharp';

interface UploadOptions {
  folder?: string;
  transformation?: UploadApiOptions['transformation'];
  allowedFormats?: string[];
}

export class MediaHandler {
  private static readonly DEFAULT_OPTIONS: UploadOptions = {
    folder: 'content',
    allowedFormats: ['jpg', 'png', 'gif', 'webp'],
    transformation: {
      quality: 'auto',
      fetch_format: 'auto',
    },
  };

  static async uploadImage(
    file: Buffer,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

      // Optimize image before upload
      const optimizedImage = await sharp(file)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'image',
              ...mergedOptions,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as UploadApiResponse);
            }
          )
          .end(optimizedImage);
      });

      return result.secure_url;
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw error;
    }
  }

  static async deleteMedia(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Media deletion failed:', error);
      throw error;
    }
  }

  static async optimizeImage(file: Buffer): Promise<Buffer> {
    return sharp(file)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }
}
