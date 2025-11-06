import { LoanStatus } from 'src/common/enum';
import { User } from 'src/resources/users/entities/user.entity';
import { Valuation } from 'src/resources/valuations/entities/valuation.entity';
import { Vehicle } from 'src/resources/vehicles/entities/vehicle.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column('decimal', { nullable: true })
  amountApproved: number;

  @Column({
    type: 'varchar',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column('int')
  tenureMonths: number;

  @Column('decimal', { default: 15.0 })
  interestRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
