import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { LoanStatus } from 'src/common/enum';

export class CreateLoanDto {
  @ApiProperty({
    type: String,
    description: 'Vehicle ID',
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    type: String,
    description: 'Valuation ID',
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  @IsNotEmpty()
  @IsUUID()
  valuationId: string;

  @ApiProperty({
    type: Number,
    description: 'Amount requested',
    example: 50000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  amountRequested: number;

  @ApiProperty({
    type: Number,
    description: 'Tenure in months',
    example: 12,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  tenureMonths: number;
}

export class UpdateLoanStatusDto {
  @IsEnum(LoanStatus)
  status: LoanStatus;
}
