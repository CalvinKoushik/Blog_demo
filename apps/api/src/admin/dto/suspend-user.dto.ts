import { IsString, IsOptional } from 'class-validator';

export class SuspendUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
