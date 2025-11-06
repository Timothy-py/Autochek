import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../common/enum';
import { AuthService } from '../resources/auth/auth.service';
import { Dealer } from '../resources/dealers/entities/dealer.entity';
import { Vehicle } from '../resources/vehicles/entities/vehicle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly authService: AuthService,

    @InjectRepository(Dealer)
    private readonly dealerRepo: Repository<Dealer>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const usersCount = await this.authService.countUsers();
    if (usersCount > 0) {
      this.logger.log('Seed data already exists, skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    const [adminUser, customerUser, dealerUser]: [any, any, any] =
      await Promise.all([
        this.authService.register({
          email: 'admin@autochek.com',
          password: 'password123',
          name: 'Timothy Admin',
          role: UserRole.ADMIN,
        }),
        this.authService.register({
          email: 'customer@autochek.com',
          password: 'password123',
          name: 'Timothy Customer',
          role: UserRole.CUSTOMER,
        }),
        this.authService.register({
          email: 'dealer@autochek.com',
          password: 'password123',
          name: 'Timothy Dealer',
          role: UserRole.DEALER,
        }),
      ]);

    const dealerId = dealerUser.data?.id;
    const dealer = await this.dealerRepo.findOne({
      where: { userId: dealerId },
    });

    // Create sample vehicles
    const vehicles = [
      {
        vin: '5FRYD4H66GB592800',
        make: 'Toyota',
        model: 'Corolla',
        year: 2015,
        mileage: 65000,
        dealer: dealer as Dealer,
      },
      {
        vin: '2T3BFREV3FW111111',
        make: 'Toyota',
        model: 'RAV4',
        year: 2018,
        mileage: 42000,
        dealer: dealer as Dealer,
      },
      {
        vin: '3FA6P0H71DR999999',
        make: 'Ford',
        model: 'Fusion',
        year: 2017,
        mileage: 50000,
        dealer: dealer as Dealer,
      },
      {
        vin: '5NPE24AF8FH222222',
        make: 'Hyundai',
        model: 'Sonata',
        year: 2016,
        mileage: 71000,
        dealer: dealer as Dealer,
      },
      {
        vin: '1G1BE5SM3H7222222',
        make: 'Chevrolet',
        model: 'Cruze',
        year: 2019,
        mileage: 30000,
        dealer: dealer as Dealer,
      },
    ];

    await this.vehicleRepo.save(this.vehicleRepo.create(vehicles));

    this.logger.log('✅ Seed data created successfully!');
  }
}
