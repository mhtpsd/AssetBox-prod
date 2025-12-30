import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum ProofType {
  FILE = 'FILE',
  TEXT = 'TEXT',
  LINK = 'LINK',
}

export class SubmitAssetDto {
  @IsEnum(ProofType)
  proofType: ProofType;

  @IsString()
  @MaxLength(5000)
  proofData: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}