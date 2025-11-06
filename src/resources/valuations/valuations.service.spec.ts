import { Test, TestingModule } from '@nestjs/testing';
import { ValuationsService } from './valuations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Valuation } from './entities/valuation.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Repository } from 'typeorm';
import {
  ForbiddenException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EStatusText } from '../../common/interfaces';
import { ValuationSource } from '../../common/enum';

describe('ValuationsService', () => {
  let service: ValuationsService;
  let valuationRepo: Repository<Valuation>;
  let vehicleRepo: Repository<Vehicle>;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockDealer = { id: 'dealer-1', userId: 'user-1' };
  const mockVehicle = {
    id: 'veh-1',
    vin: '1HGCM82633A123456',
    dealer: mockDealer,
  } as Vehicle;

  const mockValuation = {
    id: 'val-1',
    vehicleId: 'veh-1',
    requestedById: 'user-1',
    estimatedValue: 3500,
  } as Valuation;

  const mockValuationRepo = {
    create: jest.fn().mockReturnValue(mockValuation),
    save: jest.fn().mockResolvedValue(mockValuation),
  };

  const mockVehicleRepo = {
    findOne: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuationsService,
        { provide: getRepositoryToken(Valuation), useValue: mockValuationRepo },
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ValuationsService>(ValuationsService);
    valuationRepo = module.get(getRepositoryToken(Valuation));
    vehicleRepo = module.get(getRepositoryToken(Vehicle));
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('requestValuation', () => {
    const dto = { vehicleId: 'veh-1' };

    it('should successfully request valuation via external API', async () => {
      (vehicleRepo.findOne as jest.Mock).mockResolvedValue(mockVehicle);
      (httpService.get as jest.Mock).mockReturnValue(
        of({
          data: {
            loan_value: 3425,
            retail_value: 5875,
            make: 'GMC',
            model: 'Terrain',
          },
        }),
      );

      const result = await service.requestValuation(dto, 'user-1');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.statusText).toBe(EStatusText.SUCCESS);
      expect(result.message).toBe('Valuation requested successfully');
      expect(result.data).toEqual(mockValuation);
      expect(mockValuationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: 'veh-1',
          estimatedValue: 3425,
          source: ValuationSource.RAPIDAPI,
        }),
      );
    });

    it('should use fallback valuation model when external API fails', async () => {
      (vehicleRepo.findOne as jest.Mock).mockResolvedValue(mockVehicle);
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('API down')),
      );
      jest.spyOn(service as any, 'mockValuationModel').mockReturnValue(2500);

      const result = await service.requestValuation(dto, 'user-1');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.statusText).toBe(EStatusText.SUCCESS);
      expect(mockValuationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          source: ValuationSource.SIMULATED,
          estimatedValue: 2500,
        }),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      (vehicleRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.requestValuation(dto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the vehicle', async () => {
      (vehicleRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockVehicle,
        dealer: { userId: 'other-user' },
      });

      await expect(service.requestValuation(dto, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
