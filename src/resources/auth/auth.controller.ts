import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/role.decorator';
import { UserRole } from 'src/common/enum';
import { RolesGuard } from './guards/role.guard';
import { DealersService } from '../dealers/dealers.service';
import { CustomersService } from '../customers/customers.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dealerService: DealersService,
    private readonly customerService: CustomersService,
  ) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiOkResponse({
    description: 'User created successfully',
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'Logged in successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Request() req) {
    switch (req.user.role) {
      case UserRole.DEALER:
        return this.dealerService.findMyDealerProfile(req.user.id);
        break;
      case UserRole.CUSTOMER:
        return this.customerService.findMyCustomerProfile(req.user.id);
        break;
      case UserRole.ADMIN:
        return req.user;
        break;
      default:
        break;
    }
  }
}
