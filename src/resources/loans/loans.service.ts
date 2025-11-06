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

      const valuation = await this.valuationService.findById(dto.valuationId);
      if (!valuation) throw new NotFoundException('Valuation not found');

      // Simple eligibility rule: requested amount <= 90% of estimated value
      if (dto.amountRequested > 0.9 * Number(valuation.estimatedValue)) {
        throw new BadRequestException(
          'Requested amount exceeds eligibility limit',
        );
      }

      const loan = this.loanRepository.create({
        vehicle,
        valuation,
        customer: { id: userId },
        amountRequested: dto.amountRequested,
        tenureMonths: dto.tenureMonths,
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
        relations: ['customer', 'vehicle', 'valuation'],
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
}
