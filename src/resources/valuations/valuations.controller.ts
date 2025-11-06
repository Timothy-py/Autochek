import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { CreateValuationRequestDto } from './dto/valuation.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../../common/enum';

@Controller('valuations')
export class ValuationsController {
  constructor(private readonly valuationsService: ValuationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request Valuation -> DEALER|ADMIN' })
  @ApiOkResponse({
    description: 'Valuation requested successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER, UserRole.ADMIN)
  @Post()
  requestValuation(@Body() dto: CreateValuationRequestDto, @Request() req) {
    return this.valuationsService.requestValuation(dto, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all valuations -> DEALER|ADMIN' })
  @ApiOkResponse({
    description: 'Valuations fetched successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    description: 'Page number',
    required: false,
    example: 0,
  })
  @ApiQuery({
    type: Number,
    name: 'pageSize',
    description: 'Page size',
    required: false,
    example: 10,
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER, UserRole.ADMIN)
  findAll(
    @Request() req,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    page = page ? +page : 0;
    pageSize = pageSize ? +pageSize : 20;
    pageSize = pageSize > 35 ? 35 : pageSize;
    return this.valuationsService.findAll(
      req.user.id,
      req.user.role,
      page,
      pageSize,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get valuation by id -> DEALER|ADMIN' })
  @ApiOkResponse({
    description: 'Valuation fetched successfully',
  })
  @ApiNotFoundResponse({
    description: 'Valuation not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiParam({
    type: String,
    name: 'id',
    description: 'Valuation id',
    required: true,
  })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.valuationsService.findOne(id);
  }
}
