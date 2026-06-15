import { Global, Module } from '@nestjs/common';
import { SanitizeService } from './sanitize.service';
import { UrlValidationService } from './url-validation.service';

@Global()
@Module({
  providers: [SanitizeService, UrlValidationService],
  exports: [SanitizeService, UrlValidationService],
})
export class CommonModule {}
