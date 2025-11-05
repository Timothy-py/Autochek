import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Name of the customer',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone number of the customer',
    example: '+2349087678987',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Monthly income of the customer',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;
}
