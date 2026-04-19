import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import CircuitBreaker from 'opossum';
import logger from '../../utils/logger';
import sharp from 'sharp';

interface UploadOptions {
  folder?: string;
  transformation?: UploadApiOptions['transformation'];
  allowedFormats?: string[];
}

interface UploadPayload {
  optimizedImage: Buffer;
  mergedOptions: UploadOptions;
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────
// Opens after 3 failures, resets after 30 s. Prevents Cloudinary outages
// from blocking every request that tries to upload.
const cloudinaryBreaker = new CircuitBreaker(_uploadToCloudinary, {
  timeout: 20000, // 20 s — Cloudinary p99 upload time
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  volumeThreshold: 3,
  name: 'cloudinary',
});

cloudinaryBreaker.on('open', () =>
  logger.warn('Cloudinary circuit breaker OPEN')
);
cloudinaryBreaker.on('halfOpen', () =>
  logger.info('Cloudinary circuit breaker HALF-OPEN')
);
cloudinaryBreaker.on('close', () =>
  logger.info('Cloudinary circuit breaker CLOSED')
);

async function _uploadToCloudinary(payload: UploadPayload): Promise<string> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: 'image', ...payload.mergedOptions },
        (error, result) => {
          if (error) reject(new Error(error.message));
          else resolve(result as UploadApiResponse);
        }
      )
      .end(payload.optimizedImage);
  });
  return result.secure_url;
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
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    // Optimize image before upload (sharp — local, fast)
    const optimizedImage = await sharp(file)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    try {
      return await cloudinaryBreaker.fire({ optimizedImage, mergedOptions });
    } catch (error) {
      if (cloudinaryBreaker.opened) {
        logger.warn('Cloudinary circuit open — upload rejected');
        throw new Error(
          'Image upload temporarily unavailable. Please try again shortly.'
        );
      }
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
