import { LoanStatus } from '../../../common/enum';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';
import { Valuation } from '../../valuations/entities/valuation.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Valuation, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'valuationId' })
  valuation: Valuation;

  @Column({ type: 'uuid', nullable: true })
  valuationId: string;

  @Column('decimal')
  amountRequested: number;

  @Column({ type: 'decimal', default: 0 })
  amountDeposited: number;

  @Column('decimal', { nullable: true })
  amountApproved: number;

  @Column({
    type: 'varchar',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'decimal', default: 0 })
  eligibilityScore: number;

  @Column('int')
  tenureMonths: number;

  @Column('decimal', { default: 15.0 })
  interestRate: number;

  @OneToMany(() => Offer, (offer) => offer.loan, { cascade: true })
  offers: Offer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
