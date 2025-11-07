import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
} from '../../common/interfaces';
import { DealersService } from '../dealers/dealers.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly dealerService: DealersService,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    userId: string,
  ): Promise<ISuccessResponse<object> | IErrorResponse> {
    try {
      const dealer = await this.dealerService.findMyDealerProfile(userId);

      const vehicle = this.vehicleRepository.create({
        dealerId: dealer.id,
        ...createVehicleDto,
      });

      const result = await this.vehicleRepository.save(vehicle);

      return {
        statusCode: HttpStatus.CREATED,
        statusText: EStatusText.SUCCESS,
        message: 'Vehicle created successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error creating vehicle', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findAll(
    page: number,
    pageSize: number,
  ): Promise<ISuccessResponse<Vehicle[]> | IErrorResponse> {
    try {
      const vehicles = await this.vehicleRepository.find({
        where: { available: true },
        relations: ['dealer'],
        take: pageSize,
        skip: page,
      });
      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Vehicles fetched successfully',
        data: vehicles,
        extra: {
          page,
          pageSize,
          total: vehicles.length,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error fetching vehicles', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findOne(
    id: string,
  ): Promise<ISuccessResponse<Vehicle> | IErrorResponse> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, available: true },
        relations: ['dealer', 'valuations'],
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Vehicle fetched successfully',
        data: vehicle,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error fetching vehicle details', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({
      where: { id },
      relations: ['valuations'],
    });
  }

  async update(
    id: string,
    userId: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<ISuccessResponse<Vehicle> | IErrorResponse> {
    try {
      const dealer = await this.dealerService.findMyDealerProfile(userId);
      const oldVehicle = await this.vehicleRepository.findOne({
        where: { id: id, dealerId: dealer.id },
      });

      if (!oldVehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      const vehicel = this.vehicleRepository.merge(
        oldVehicle,
        updateVehicleDto,
      );
      const updatedVehicle = await this.vehicleRepository.save(vehicel);

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Vehicle updated successfully',
        data: updatedVehicle,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error updating vehicle', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
