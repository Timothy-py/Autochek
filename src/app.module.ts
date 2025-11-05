import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfiguration from './common/env.configuration';
import { envValidation } from './common/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

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
          entities: [],
          // migrations: [],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
