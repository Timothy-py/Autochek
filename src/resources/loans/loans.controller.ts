import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanStatusDto } from './dto/loan.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from 'src/common/enum';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a loan -> CUSTOMER' })
  @ApiCreatedResponse({ description: 'Loan applied successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  async apply(@Body() dto: CreateLoanDto, @Request() req) {
    return this.loansService.applyForLoan(dto, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update loan status -> ADMIN' })
  @ApiOkResponse({ description: 'Loan status updated successfully' })
  @ApiNotFoundResponse({ description: 'Loan not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLoanStatusDto,
    @Request() req,
  ) {
    return this.loansService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get loans for a customer -> CUSTOMER' })
  @ApiOkResponse({ description: 'Loans retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-loans')
  async getMyLoans(@Request() req) {
    return this.loansService.getLoansForCustomer(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all loans -> ADMIN' })
  @ApiOkResponse({ description: 'Loans retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    type: Number,
    name: 'page',
    description: 'Page number',
    required: false,
    example: 0,
  })
  @ApiParam({
    type: Number,
    name: 'pageSize',
    description: 'Page size',
    required: false,
    example: 10,
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAll(
    @Param('page') page: number,
    @Param('pageSize') pageSize: number,
  ) {
    page = page ? +page : 0;
    pageSize = pageSize ? +pageSize : 20;
    pageSize = pageSize > 35 ? 35 : pageSize;
    return this.loansService.getAllLoans(page, pageSize);
  }
}
