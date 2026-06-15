import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_PROTOCOLS = ['https:', 'http:'];
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

@Injectable()
export class UrlValidationService {
  /** Validates remote image/asset URLs before persisting (upload prep). */
  validateAssetUrl(url: string | null | undefined, field = 'URL'): string | null {
    if (url == null || url === '') return null;
    const trimmed = url.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException(`Invalid ${field}`);
    }
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      throw new BadRequestException(`${field} must use http or https`);
    }
    if (BLOCKED_HOSTS.includes(parsed.hostname)) {
      throw new BadRequestException(`${field} host is not allowed`);
    }
    if (trimmed.length > 2048) {
      throw new BadRequestException(`${field} is too long`);
    }
    return trimmed;
  }
}
