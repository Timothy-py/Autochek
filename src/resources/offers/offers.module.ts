import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { LoansService } from '../loans/loans.service';
import { Loan } from '../loans/entities/loan.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationsService } from '../valuations/valuations.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DealersService } from '../dealers/dealers.service';
import { Valuation } from '../valuations/entities/valuation.entity';
import { Dealer } from '../dealers/entities/dealer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Loan, Vehicle, Valuation, Dealer]),
  ],
  controllers: [OffersController],
  providers: [
    OffersService,
    LoansService,
    VehiclesService,
    ValuationsService,
    DealersService,
  ],
})
export class OffersModule {}
