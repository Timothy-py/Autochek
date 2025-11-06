import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto, RespondOfferDto } from './dto/offer.dto';
import {
  CustomerOfferStatus,
  LoanStatus,
  OfferStatus,
} from '../../common/enum';
import { LoansService } from '../loans/loans.service';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
} from '../../common/interfaces';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly loanService: LoansService,
  ) {}

  /**
   * Creates a new offer for a loan.
   *
   * - Finds the loan by ID and validates its status.
   * - Creates an offer for the loan and its customer using the provided details.
   * - Saves the offer to the database and returns a success response.
   * - Throws errors if the loan is not found or is rejected.
   *
   * @param {CreateOfferDto} dto - The offer creation data (loanId, offeredAmount, interestRate, tenureMonths).
   * @returns {Promise<ISuccessResponse<Offer> | IErrorResponse>} The result of the offer creation.
   */
  async createOffer(
    dto: CreateOfferDto,
  ): Promise<ISuccessResponse<Offer> | IErrorResponse> {
    try {
      const loan = await this.loanService.findById(dto.loanId);
      if (!loan) throw new NotFoundException('Loan not found');

      if (loan.status === LoanStatus.REJECTED)
        throw new BadRequestException('Cannot create offer for rejected loan');

      const offer = this.offerRepository.create({
        loan,
        customer: loan.customer,
        ...dto,
      });

      const result = await this.offerRepository.save(offer);
      return {
        statusCode: HttpStatus.CREATED,
        statusText: EStatusText.SUCCESS,
        message: 'Offer created successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error creating offer', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  /**
   * Handles a customer's response to an offer (accept or reject).
   *
   * - Finds the offer and validates ownership and status.
   * - If accepted, marks the offer as accepted, approves the linked loan, update the associated
   *   vehicle as unavailable and expires other offers for the same loan.
   * - If rejected, marks the offer as rejected.
   * - Saves the updated offer and returns a success response.
   * - Throws errors for invalid offer, ownership, or status.
   *
   * @param {RespondOfferDto} dto - The offer response data (offerId, status).
   * @param {string} userId - The ID of the customer responding to the offer.
   * @returns {Promise<ISuccessResponse<Offer> | IErrorResponse>} The result of the offer response.
   */
  async respondToOffer(
    dto: RespondOfferDto,
    userId: string,
  ): Promise<ISuccessResponse<Offer> | IErrorResponse> {
    try {
      const offer = await this.offerRepository.findOne({
        where: { id: dto.offerId },
        relations: ['customer', 'loan'],
      });
      if (!offer) throw new NotFoundException('Offer not found');

      if (offer.customer.id !== userId)
        throw new ForbiddenException('You can only respond to your own offers');

      if (offer.status !== OfferStatus.PENDING)
        throw new BadRequestException('Offer is no longer active');

      // Handle acceptance or rejection
      if (dto.status === CustomerOfferStatus.ACCEPTED) {
        offer.status = OfferStatus.ACCEPTED;
        offer.acceptedAt = new Date();

        // Update the linked loan
        offer.loan.status = LoanStatus.APPROVED;
        await this.loanService.saveLoan(offer.loan);

        // Mark vehicle as unavailable
        offer.loan.vehicle.available = false;
        await this.vehicleRepository.save(offer.loan.vehicle);

        // Expire all other offers for the same loan
        await this.offerRepository.update(
          { loan: { id: offer.loan.id }, id: Not(offer.id) },
          { status: OfferStatus.EXPIRED },
        );
      } else if (dto.status === CustomerOfferStatus.REJECTED) {
        offer.status = OfferStatus.REJECTED;
        offer.rejectedAt = new Date();
      }

      const result = await this.offerRepository.save(offer);

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Offer updated successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error responding to offer', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getOffersForUser(
    userId: string,
  ): Promise<ISuccessResponse<Offer[]> | IErrorResponse> {
    try {
      const offers = await this.offerRepository.find({
        where: { customer: { id: userId } },
      });

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Offers fetched successfully',
        data: offers,
      };
    } catch (error) {
      this.logger.error('Error fetching offers for user', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getAllOffers(
    page: number,
    pageSize: number,
  ): Promise<ISuccessResponse<Offer[]>> {
    const offers = await this.offerRepository.find({
      take: pageSize,
      skip: page,
    });

    return {
      statusCode: HttpStatus.OK,
      statusText: EStatusText.SUCCESS,
      message: 'Offers fetched successfully',
      data: offers,
      extra: {
        page,
        pageSize,
        total: offers.length,
      },
    };
  }
}
