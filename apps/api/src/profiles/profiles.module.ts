import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [PrismaModule],
  providers: [ProfileService],
  controllers: [ProfilesController],
  exports: [ProfileService],
})
export class ProfilesModule {}
