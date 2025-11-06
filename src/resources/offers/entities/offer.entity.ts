import { OfferStatus } from '../../../common/enum';
import { Loan } from '../../loans/entities/loan.entity';
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Loan, { eager: true })
  loan: Loan;

  @ManyToOne(() => User, { eager: true })
  customer: User;

  @Column('decimal')
  offeredAmount: number;

  @Column('decimal')
  interestRate: number;

  @Column({ type: 'int' })
  tenureMonths: number;

  @Column({ type: 'varchar', enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
