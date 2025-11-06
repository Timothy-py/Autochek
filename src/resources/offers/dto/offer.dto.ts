import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { CustomerOfferStatus } from 'src/common/enum';

export class CreateOfferDto {
  @ApiProperty({
    type: String,
    description: 'Loan ID',
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  @IsUUID()
  loanId: string;

  @ApiProperty({
    type: Number,
    description: 'Offered amount',
    example: 50000,
  })
  @IsNumber()
  @IsPositive()
  offeredAmount: number;

  @ApiProperty({
    type: Number,
    description: 'Interest rate',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  interestRate: number;

  @ApiProperty({
    type: Number,
    description: 'Tenure in months',
    example: 12,
  })
  @IsNumber()
  tenureMonths: number;
}

export class RespondOfferDto {
  @ApiProperty({
    type: String,
    description: 'Offer ID',
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  @IsUUID()
  offerId: string;

  @ApiProperty({
    type: String,
    description: 'Offer status',
    example: 'ACCEPTED',
    enum: CustomerOfferStatus,
  })
  @IsEnum(CustomerOfferStatus)
  status: CustomerOfferStatus;
}
