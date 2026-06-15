import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadFolder = 'avatars' | 'thumbnails' | 'posts';

@Injectable()
export class UploadsService {
  private configured = false;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
    }
  }

  assertConfigured() {
    if (!this.configured) {
      throw new BadRequestException(
        'Image uploads are not configured. Set CLOUDINARY_* env vars.',
      );
    }
  }

  validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5MB or smaller');
    }
  }

  async uploadBuffer(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<{ url: string; publicId: string; width: number; height: number }> {
    this.assertConfigured();
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `studenthub/${folder}`,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => {
          if (err || !result) {
            reject(new InternalServerErrorException('Upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }
}
