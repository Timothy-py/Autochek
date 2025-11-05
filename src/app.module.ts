import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfiguration from './common/env.configuration';
import { envValidation } from './common/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { UsersModule } from './resources/users/users.module';
import { AuthModule } from './resources/auth/auth.module';
import { User } from './resources/users/entities/user.entity';
import { Dealer } from './resources/dealers/entities/dealer.entity';
import { DealersModule } from './resources/dealers/dealers.module';
import { Customer } from './resources/customers/entities/customer.entity';
import { CustomersModule } from './resources/customers/customers.module';
import { VehiclesModule } from './resources/vehicles/vehicles.module';
import { Vehicle } from './resources/vehicles/entities/vehicle.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfiguration],
      isGlobal: true,
      cache: true,
      validate: envValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        return {
          type: 'sqlite',
          database: ':memory',
          synchronize: true, // TODO: Change to false in Production
          logging: ['error', 'warn'],
          entities: [User, Dealer, Customer, Vehicle],
          // migrations: [],
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DealersModule,
    CustomersModule,
    VehiclesModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
