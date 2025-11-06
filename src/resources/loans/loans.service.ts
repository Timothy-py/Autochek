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
import { LoanStatus } from 'src/common/enum';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationsService } from '../valuations/valuations.service';
import {
  EStatusText,
  IErrorResponse,
  ISuccessResponse,
} from 'src/common/interfaces';
import { Valuation } from '../valuations/entities/valuation.entity';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>,
    private readonly vehicleService: VehiclesService,
    private readonly valuationService: ValuationsService,
  ) {}

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

  private simulateCreditScore(userId: string): number {
    // In real life, we'd pull from credit history or repayment data.
    const seed = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (seed % 50); // Always between 50 and 100
  }
}
