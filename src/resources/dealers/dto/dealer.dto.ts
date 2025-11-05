import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDealerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateDealerDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Name of the dealer',
    example: 'Timothy',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone number of the dealer',
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Company name of the dealer',
    example: 'Best Cars Ltd.',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Address of the dealer',
    example: '123 Main St, Anytown, Lagos',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
