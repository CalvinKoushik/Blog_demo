import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  collegeName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  department?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  year?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  portfolioUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  resumeUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string;
}
