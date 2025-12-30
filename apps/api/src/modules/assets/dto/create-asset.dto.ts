import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum AssetType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  TWO_D = 'TWO_D',
  THREE_D = 'THREE_D',
}

export enum LicenseType {
  STANDARD = 'STANDARD',
  COMMERCIAL = 'COMMERCIAL',
  EXTENDED = 'EXTENDED',
}

export class CreateAssetDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag:  string) => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  price: number;
}