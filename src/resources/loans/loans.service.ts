import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto, UpdateLoanStatusDto } from './dto/loan.dto';
import { LoanStatus } from '../../common/enum';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationsService } from '../valuations/valuations.service';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
} from '../../common/interfaces';
import { Valuation } from '../valuations/entities/valuation.entity';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>,
    private readonly vehicleService: VehiclesService,
    private readonly valuationService: ValuationsService,
  ) {}

  /**
   * Applies for a loan for a given vehicle and user.
   *
   * - Fetches the vehicle by ID.
   * - Uses the provided valuation ID or the latest valuation for the vehicle.
   * - Calculates loan eligibility score based on valuation, vehicle year, and requested amount.
   * - Creates and saves a new loan record.
   * - Returns a success response with the loan data, or throws appropriate errors if validation fails.
   *
   * @param {CreateLoanDto} dto - The loan application data (vehicleId, amountRequested, tenureMonths, optional valuationId).
   * @param {string} userId - The ID of the user applying for the loan.
   * @returns {Promise<ISuccessResponse<Loan> | IErrorResponse>} The result of the loan application.
   */
  async applyForLoan(
    dto: CreateLoanDto,
    userId: string,
  ): Promise<ISuccessResponse<Loan> | IErrorResponse> {
    try {
      const vehicle = await this.vehicleService.findById(dto.vehicleId);
      if (!vehicle) throw new NotFoundException('Vehicle not found');

      let valuation: Valuation | null = null;

      if (dto.valuationId) {
        valuation = await this.valuationService.findById(dto.valuationId);
        if (!valuation) throw new NotFoundException('Valuation not found');
      } else {
        valuation = vehicle.valuations?.[vehicle.valuations.length - 1];
        if (!valuation)
          throw new BadRequestException('Vehicle has no valuation data');
      }
      console.log(valuation);

      const eligibilityScore = this.eligibiltyScoring(
        userId,
        valuation.estimatedValue,
        vehicle.year,
        dto.amountRequested,
      );

      const loan = this.loanRepository.create({
        vehicle,
        valuation: valuation,
        customer: { id: userId },
        amountRequested: dto.amountRequested,
        tenureMonths: dto.tenureMonths,
        eligibilityScore: eligibilityScore,
      });

      const result = await this.loanRepository.save(loan);
      return {
        statusCode: HttpStatus.CREATED,
        statusText: EStatusText.SUCCESS,
        message: 'Loan application submitted successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error applying for loan', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateStatus(id: string, dto: UpdateLoanStatusDto) {
    try {
      const loan = await this.loanRepository.findOne({ where: { id } });
      if (!loan) throw new NotFoundException('Loan not found');

      loan.status = dto.status;
      if (dto.status === LoanStatus.APPROVED)
        loan.amountApproved = loan.amountRequested;

      await this.loanRepository.save(loan);
      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: `Loan ${dto.status.toLowerCase()}`,
        data: loan,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error updating loan status', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getLoansForCustomer(
    userId: string,
  ): Promise<ISuccessResponse<Loan[] | IErrorResponse>> {
    try {
      const loans = await this.loanRepository.find({
        where: { customerId: userId },
        relations: ['vehicle', 'valuation'],
      });

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Loans fetched successfully',
        data: loans,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.logger.error('Error fetching loans for customer', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getAllLoans(
    page: number,
    pageSize: number,
  ): Promise<ISuccessResponse<Loan[]> | IErrorResponse> {
    try {
      const loans = await this.loanRepository.find({
        // relations: ['customer', 'vehicle', 'valuation'],
        take: pageSize,
        skip: page,
      });

      return {
        statusCode: HttpStatus.OK,
        statusText: EStatusText.SUCCESS,
        message: 'Loans fetched successfully',
        data: loans,
        extra: {
          page,
          pageSize,
          total: loans.length,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching loans for customer', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  /**
   * Calculates the loan eligibility score for a customer based on valuation, vehicle age, requested amount, and simulated credit score.
   *
   * - Loan-to-value ratio is penalized for higher requested amounts relative to valuation.
   * - Vehicle age reduces the score for older vehicles.
   * - Simulated credit score adds a user-specific factor.
   * - Final score is a weighted sum of LTV, age, and credit score.
   *
   * @param {string} userId - The ID of the customer applying for the loan.
   * @param {number} valuationEstimatedValue - The estimated value of the vehicle from valuation.
   * @param {number} vehicleYear - The year the vehicle was manufactured.
   * @param {number} amountRequested - The amount of loan requested by the customer.
   * @returns {number} The computed eligibility score (higher is better).
   */
  private eligibiltyScoring(
    userId: string,
    valuationEstimatedValue: number,
    vehicleYear: number,
    amountRequested: number,
  ): number {
    // --- Compute Eligibility ---
    const valuation = valuationEstimatedValue;
    const loanToValueRatio = amountRequested / valuation;
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    const creditScore = this.simulateCreditScore(userId);

    const ltvScore = Math.max(0, 100 - loanToValueRatio * 100);
    const ageScore = Math.max(0, 100 - vehicleAge * 5);
    const weightedScore = 0.5 * ltvScore + 0.25 * ageScore + 0.25 * creditScore;

    return weightedScore;
  }

  /**
   * Simulates a credit score for a user based on their userId.
   *
   * - In a real system, this would use actual credit history or repayment data.
   * - Here, it generates a pseudo-random score between 50 and 100 using the userId as a seed.
   *
   * @param {string} userId - The ID of the user for whom to simulate a credit score.
   * @returns {number} A simulated credit score (between 50 and 100).
   */
  private simulateCreditScore(userId: string): number {
    const seed = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (seed % 50); // Always between 50 and 100
  }

  async findById(id: string): Promise<Loan | null> {
    return this.loanRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
  }

  async saveLoan(loan: Loan): Promise<Loan> {
    return this.loanRepository.save(loan);
  }
}
