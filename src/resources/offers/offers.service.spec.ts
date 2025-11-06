import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import {
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { LoansService } from '../loans/loans.service';
import { Loan } from '../loans/entities/loan.entity';
import {
  CustomerOfferStatus,
  LoanStatus,
  OfferStatus,
} from '../../common/enum';
import { EStatusText, ISuccessResponse } from '../../common/interfaces';

describe('OffersService', () => {
  let service: OffersService;
  let offerRepository: Repository<Offer>;
  let vehicleRepository: Repository<Vehicle>;
  let loanService: LoansService;

  const mockVehicle = { id: 'veh-1', available: true } as Vehicle;
  const mockLoan = {
    id: 'loan-1',
    status: LoanStatus.PENDING,
    vehicle: mockVehicle,
  } as Loan;

  const mockCustomer = { id: 'cust-1' };
  const mockOffer = {
    id: 'offer-1',
    status: OfferStatus.PENDING,
    customer: mockCustomer,
    loan: mockLoan,
  } as Offer;

  const mockOfferRepo = {
    findOne: jest.fn() as jest.Mock,
    save: jest.fn() as jest.Mock,
    update: jest.fn(),
  };

  const mockVehicleRepo = {
    save: jest.fn(),
  };

  const mockLoanService = {
    saveLoan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepo },
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepo },
        { provide: LoansService, useValue: mockLoanService },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    offerRepository = module.get(getRepositoryToken(Offer));
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
    loanService = module.get(LoansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock object states
    mockOffer.status = OfferStatus.PENDING;
    mockLoan.status = LoanStatus.PENDING;
    mockVehicle.available = true;
  });

  describe('respondToOffer', () => {
    it('should accept an offer → approve loan → mark vehicle unavailable → expire others', async () => {
      // Arrange
      (offerRepository.findOne as jest.Mock).mockResolvedValue(mockOffer);
      (offerRepository.save as jest.Mock).mockResolvedValue({
        ...mockOffer,
        status: OfferStatus.ACCEPTED,
      });

      const dto = { offerId: 'offer-1', status: CustomerOfferStatus.ACCEPTED };

      // Act
      const result = (await service.respondToOffer(
        dto,
        'cust-1',
      )) as ISuccessResponse<Offer>;

      // Assert
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.statusText).toBe(EStatusText.SUCCESS);
      expect(result.data.status).toBe(OfferStatus.ACCEPTED);
      expect(mockLoan.status).toBe(LoanStatus.APPROVED);
      expect(mockVehicle.available).toBe(false);

      // Verify method calls
      expect(loanService.saveLoan).toHaveBeenCalledWith(mockLoan);
      expect(vehicleRepository.save).toHaveBeenCalledWith(mockVehicle);
      expect(offerRepository.update).toHaveBeenCalledWith(
        { loan: { id: mockLoan.id }, id: Not(mockOffer.id) },
        { status: OfferStatus.EXPIRED },
      );
      expect(offerRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own the offer', async () => {
      (offerRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockOffer,
        customer: { id: 'other-user' },
      });

      await expect(
        service.respondToOffer(
          { offerId: 'offer-1', status: CustomerOfferStatus.ACCEPTED },
          'cust-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if offer not found', async () => {
      (offerRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.respondToOffer(
          { offerId: 'invalid', status: CustomerOfferStatus.ACCEPTED },
          'cust-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle rejection correctly', async () => {
      (offerRepository.findOne as jest.Mock).mockResolvedValue(mockOffer);
      (offerRepository.save as jest.Mock).mockResolvedValue({
        ...mockOffer,
        status: OfferStatus.REJECTED,
      });

      const dto = { offerId: 'offer-1', status: CustomerOfferStatus.REJECTED };
      const result = (await service.respondToOffer(dto, 'cust-1')) as any;

      expect(result.data.status).toBe(OfferStatus.REJECTED);
      expect(mockLoan.status).toBe(LoanStatus.PENDING); // loan unchanged
      expect(loanService.saveLoan).not.toHaveBeenCalled();
    });
  });
});
