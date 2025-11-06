import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException,
  Logger,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
  JwtPayload,
} from '../../common/interfaces';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { HelperService } from '../../common/helpers';
import { UserRole } from '../../common/enum';
import { DealersService } from '../dealers/dealers.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly dealersService: DealersService,
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<ISuccessResponse<object> | IErrorResponse> {
    try {
      const { email, password, role, ...otherData } = registerDto;
      const existing = await this.usersService.findByEmail(email);

      if (existing) throw new ConflictException('Email already exist');

      const hashed = await this.helperService.hashPassword(password);

      const user = await this.usersService.create({
        email,
        passwordHash: hashed,
        role: role,
      });

      switch (role) {
        case UserRole.DEALER:
          await this.dealersService.create(otherData, user.id);
          break;
        case UserRole.CUSTOMER:
          await this.customersService.create(otherData, user.id);
          break;
        default:
          break;
      }

      return {
        statusCode: HttpStatus.CREATED,
        statusText: EStatusText.SUCCESS,
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error registering user', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<ISuccessResponse<object> | IErrorResponse> {
    try {
      const { email, password } = loginDto;
      const user = await this.usersService.findByEmail(email);

      if (!user) throw new UnauthorizedException('Invalid credentials');

      const valid = await this.helperService.comparePassword(
        user.passwordHash,
        password,
      );
      if (!valid) throw new UnauthorizedException('Invalid credentials');

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const access_token = this.jwtService.sign(payload);

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'User logged in successfully',
        data: { access_token, ...user },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error logging in user', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async validateUser(payload: JwtPayload) {
    return this.usersService.findById(payload.sub);
  }

  async countUsers(): Promise<number> {
    return await this.usersService.countUsers();
  }
}
