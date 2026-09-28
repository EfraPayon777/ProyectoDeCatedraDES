import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lubripoint',
      api_key: process.env.CLOUDINARY_API_KEY || '123456789',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'secret_key',
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'lubripoint_repuestos' },
        (error, result) => {
          if (error) {
            // Fallback base64 / data URL if Cloudinary credentials are mock
            const base64Data = file.buffer.toString('base64');
            const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
            resolve(dataUrl);
          } else {
            resolve(result.secure_url);
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
