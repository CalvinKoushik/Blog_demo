import { Injectable } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'hr',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'class'];

@Injectable()
export class SanitizeService {
  sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });
  }

  stripHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] }).trim();
  }
}
