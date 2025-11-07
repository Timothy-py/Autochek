import { Module } from '@nestjs/common';
import { DealersService } from './dealers.service';
import { DealersController } from './dealers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealer } from './entities/dealer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [DealersController],
  providers: [DealersService],
})
export class DealersModule {}
