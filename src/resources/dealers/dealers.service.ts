import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealer } from './entities/dealer.entity';
import { CreateDealerDto, UpdateDealerDto } from './dto/dealer.dto';

@Injectable()
export class DealersService {
  private readonly logger = new Logger(DealersService.name);
  constructor(
    @InjectRepository(Dealer)
    private readonly dealerRepository: Repository<Dealer>,
  ) {}

  async create(
    createDealerDto: CreateDealerDto,
    userId: string,
  ): Promise<Dealer> {
    const dealer = this.dealerRepository.create({
      ...createDealerDto,
      userId: userId,
    });

    return await this.dealerRepository.save(dealer);
  }

  async update(id: string, updateDealerDto: UpdateDealerDto): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({
      where: { userId: id },
    });
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    Object.assign(dealer, updateDealerDto);
    return await this.dealerRepository.save(dealer);
  }

  async findMyDealerProfile(userId: string): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({
      where: { userId: userId },
      relations: ['user'],
    });

    if (!dealer) {
      throw new NotFoundException('Dealer profile not found');
    }

    return dealer;
  }
}
