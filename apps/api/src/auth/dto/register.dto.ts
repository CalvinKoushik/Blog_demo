import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username may only contain letters, numbers, underscores, and hyphens',
  })
  nickname: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  collegeName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  department: string;

  @IsInt()
  @Min(1)
  @Max(6)
  year: number;

  @IsUrl({ require_protocol: true })
  linkedinUrl: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
