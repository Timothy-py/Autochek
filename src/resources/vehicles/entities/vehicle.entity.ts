import { Dealer } from 'src/resources/dealers/entities/dealer.entity';
import { Valuation } from 'src/resources/valuations/entities/valuation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  vin: string; // Vehicle Identification Number

  @Column({ type: 'varchar' })
  make: string;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int', nullable: true })
  mileage: number;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'varchar', nullable: true })
  transmission: string;

  @Column({ type: 'decimal', nullable: true })
  price: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @Column({ type: 'uuid' })
  dealerId: string;

  @ManyToOne(() => Dealer, (dealer) => dealer.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealerId' })
  dealer: Dealer;

  @OneToMany(() => Valuation, (valuation) => valuation.vehicle)
  valuations: Valuation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
