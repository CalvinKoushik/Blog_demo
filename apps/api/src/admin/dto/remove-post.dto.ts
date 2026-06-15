import { IsString, IsOptional } from 'class-validator';

export class RemovePostDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
