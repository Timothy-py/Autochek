import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { DealersService } from '../dealers/dealers.service';
import { Dealer } from '../dealers/entities/dealer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Dealer])],
  controllers: [VehiclesController],
  providers: [VehiclesService, DealersService],
})
export class VehiclesModule {}
