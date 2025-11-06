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
import { OffersService } from './offers.service';
import { CreateOfferDto, RespondOfferDto } from './dto/offer.dto';
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
import { UserRole } from '../../common/enum';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an offer -> ADMIN' })
  @ApiCreatedResponse({ description: 'Offer created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createOffer(@Body() dto: CreateOfferDto, @Request() req) {
    return this.offersService.createOffer(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to an offer -> CUSTOMER' })
  @ApiOkResponse({ description: 'Responded to offer successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('respond')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  respondToOffer(@Body() dto: RespondOfferDto, @Request() req) {
    return this.offersService.respondToOffer(dto, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get offers for a customer -> CUSTOMER' })
  @ApiOkResponse({ description: 'Retrieved offers successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-offers')
  getMyOffers(@Request() req) {
    return this.offersService.getOffersForUser(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all offers -> ADMIN' })
  @ApiOkResponse({ description: 'Retrieved offers successfully' })
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllOffers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    page = page ? +page : 0;
    pageSize = pageSize ? +pageSize : 20;
    pageSize = pageSize > 35 ? 35 : pageSize;
    return this.offersService.getAllOffers(page, pageSize);
  }
}
