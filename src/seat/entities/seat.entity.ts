import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bus } from 'src/bus/entities/bus.entity';

@Entity('Seats')
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'smallint', unique: true })
    seatNumber: number;

    @Column({ type: 'boolean', nullable: true })
    isAvailable: boolean;

    @ManyToOne(() => Bus, (bus) => bus.seats)
    bus: Bus;
}