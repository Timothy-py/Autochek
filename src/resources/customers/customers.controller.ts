import { Body, Controller, Patch, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from 'src/common/enum';
import { UpdateCustomerDto } from './dto/customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer information' })
  @ApiOkResponse({ description: 'customer information updated successfully' })
  @ApiNotFoundResponse({ description: 'customer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Patch(':id')
  update(@Body() updateCustomerDto: UpdateCustomerDto, @Request() req) {
    return this.customersService.update(req.user.id, updateCustomerDto);
  }
}
