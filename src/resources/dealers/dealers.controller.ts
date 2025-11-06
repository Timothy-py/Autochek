import { Body, Controller, Request, Patch, UseGuards } from '@nestjs/common';
import { DealersService } from './dealers.service';
import { UpdateDealerDto } from './dto/dealer.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../../common/enum';

@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update dealer information' })
  @ApiOkResponse({ description: 'Dealer information updated successfully' })
  @ApiNotFoundResponse({ description: 'Dealer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER)
  @Patch(':id')
  update(@Body() updateDealerDto: UpdateDealerDto, @Request() req) {
    return this.dealersService.update(req.user.id, updateDealerDto);
  }
}
