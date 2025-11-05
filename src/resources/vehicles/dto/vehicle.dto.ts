import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    type: String,
    description: 'Vehicle Identification Number',
    example: '1HGCM82633A123456',
  })
  @IsNotEmpty()
  @IsString()
  vin: string;

  @ApiProperty({
    type: String,
    description: 'Make of the vehicle',
    example: 'Honda',
  })
  @IsNotEmpty()
  @IsString()
  make: string;

  @ApiProperty({
    type: String,
    description: 'Model of the vehicle',
    example: 'Civic',
  })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({
    type: Number,
    description: 'Year of the vehicle',
    example: 2022,
  })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Mileage of the vehicle',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Color of the vehicle',
    example: 'Red',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Transmission of the vehicle',
    example: 'Automatic',
  })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Price of the vehicle',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Make of the vehicle',
    example: 'Honda',
  })
  @IsOptional()
  @IsString()
  make: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Model of the vehicle',
    example: 'Civic',
  })
  @IsOptional()
  @IsString()
  model: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Year of the vehicle',
    example: 2022,
  })
  @IsOptional()
  @IsNumber()
  year: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Mileage of the vehicle',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Color of the vehicle',
    example: 'Red',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Transmission of the vehicle',
    example: 'Automatic',
  })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Price of the vehicle',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}
