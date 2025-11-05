import { UserRole } from 'src/common/enum';
import { Customer } from 'src/resources/customers/entities/customer.entity';
import { Dealer } from 'src/resources/dealers/entities/dealer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'text', enum: UserRole })
  role: string;

  @OneToOne(() => Dealer, (dealer) => dealer.user)
  dealer: Dealer;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
