import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Valuation } from './entities/valuation.entity';
import { CreateValuationRequestDto } from './dto/valuation.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { firstValueFrom } from 'rxjs';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
} from 'src/common/interfaces';
import { UserRole, ValuationSource } from 'src/common/enum';

@Injectable()
export class ValuationsService {
  private readonly logger = new Logger(ValuationsService.name);
  constructor(
    @InjectRepository(Valuation)
    private readonly valuationRepository: Repository<Valuation>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async requestValuation(
    dto: CreateValuationRequestDto,
    userId: string,
  ): Promise<ISuccessResponse<Valuation>> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: dto.vehicleId },
      relations: ['dealer'],
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Enforce dealer ownership
    if (vehicle.dealer.userId !== userId) {
      throw new ForbiddenException(
        'You can only request valuation for your own vehicle',
      );
    }

    let estimatedValue: number;
    let externalResponse: any;
    let source: ValuationSource;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          'https://vin-lookup2.p.rapidapi.com/vehicle-lookup',
          {
            params: { vin: vehicle.vin },
            headers: {
              'x-rapidapi-key': this.configService.get(
                'RAPIDAPI_KEY',
              ) as string,
              'x-rapidapi-host': 'vin-lookup2.p.rapidapi.com',
            },
          },
        ),
      );

      externalResponse = data;
      source = ValuationSource.RAPIDAPI;
      estimatedValue = data?.loan_value ?? data?.retail_value;
    } catch (err) {
      this.logger.warn('External API failed, using fallback valuation model');
      estimatedValue = this.mockValuationModel(vehicle);
      externalResponse = { fallback: true, reason: err.message };
      source = ValuationSource.SIMULATED;
    }

    const valuation = this.valuationRepository.create({
      vehicleId: vehicle.id,
      requestedById: userId,
      estimatedValue,
      externalResponse,
      source: source,
    });

    const result = await this.valuationRepository.save(valuation);

    return {
      statusCode: HttpStatus.OK,
      statusText: EStatusText.SUCCESS,
      message: 'Valuation requested successfully',
      data: result,
    };
  }

  private mockValuationModel(vehicle: Vehicle): number {
    const depreciationRate = 0.15; // 15% per year depreciation
    const basePrice = 30000;
    const age = new Date().getFullYear() - vehicle.year;
    const mileagePenalty = (vehicle.mileage ?? 0) * 0.05;

    return Math.max(
      basePrice * Math.pow(1 - depreciationRate, age) - mileagePenalty,
      2000,
    );
  }

  async findAll(
    userId: string,
    role: UserRole,
    page: number,
    pageSize: number,
  ): Promise<ISuccessResponse<Valuation[]> | IErrorResponse> {
    try {
      console.log(userId, role, page, pageSize);
      let valuations: Valuation[] = [];
      // Admins can see all; Dealers only their own
      if (role === UserRole.ADMIN) {
        valuations = await this.valuationRepository.find({
          relations: ['vehicle', 'requestedBy'],
          take: pageSize,
          skip: page,
        });
      } else if (role === UserRole.DEALER) {
        valuations = await this.valuationRepository.find({
          where: { requestedById: userId },
          relations: ['vehicle'],
          take: pageSize,
          skip: page,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Valuations fetched successfully',
        data: valuations,
      };
    } catch (error) {
      this.logger.error('Error fetching valuations', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findOne(
    id: string,
  ): Promise<ISuccessResponse<Valuation> | IErrorResponse> {
    try {
      const valuation = await this.valuationRepository.findOne({
        where: { id },
        relations: ['vehicle', 'requestedBy'],
      });

      if (!valuation) throw new NotFoundException('Valuation not found');

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Valuation details fetched successfully',
        data: valuation,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error fetching valuation details', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findById(id: string): Promise<Valuation | null> {
    return this.valuationRepository.findOne({ where: { id } });
  }
}
