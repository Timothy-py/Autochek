import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationsService } from '../valuations/valuations.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DealersService } from '../dealers/dealers.service';
import { Valuation } from '../valuations/entities/valuation.entity';
import { Dealer } from '../dealers/entities/dealer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Vehicle, Valuation, Dealer])],
  controllers: [LoansController],
  providers: [LoansService, VehiclesService, ValuationsService, DealersService],
})
export class LoansModule {}
