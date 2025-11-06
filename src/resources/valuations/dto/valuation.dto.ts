import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateValuationRequestDto {
  @ApiProperty({
    type: String,
    description: 'Vehicle ID',
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;
}
