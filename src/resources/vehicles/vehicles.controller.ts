import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from 'src/common/enum';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create vehicle -> DEALER' })
  @ApiCreatedResponse({ description: 'Vehicle created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER)
  @Post()
  create(@Body() dto: CreateVehicleDto, @Request() req) {
    return this.vehiclesService.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiOkResponse({ description: 'Vehicles fetched successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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
  @Public()
  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    page = page ? +page : 0;
    pageSize = pageSize ? +pageSize : 20;
    pageSize = pageSize > 35 ? 35 : pageSize;
    return await this.vehiclesService.findAll(page, pageSize);
  }

  @ApiOperation({ summary: 'Get vehicle by id' })
  @ApiOkResponse({ description: 'Vehicle fetched successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    type: String,
    name: 'id',
    description: 'Vehicle id',
    required: true,
  })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vehicle -> DEALER' })
  @ApiOkResponse({ description: 'Vehicle updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    type: String,
    name: 'id',
    description: 'Vehicle id',
    required: true,
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEALER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @Request() req,
  ) {
    return this.vehiclesService.update(id, req.user.id, dto);
  }
}
