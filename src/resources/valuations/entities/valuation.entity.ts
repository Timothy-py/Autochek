import { ValuationSource } from 'src/common/enum';
import { User } from 'src/resources/users/entities/user.entity';
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

@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column()
  vehicleId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @Column({ nullable: true })
  requestedById: string;

  @Column({ type: 'float', nullable: true })
  estimatedValue: number;

  @Column({
    type: 'varchar',
    enum: ValuationSource,
    default: ValuationSource.SIMULATED,
  })
  source: ValuationSource;

  @Column({ type: 'json', nullable: true })
  externalResponse: any; // Store the full API or model response

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
