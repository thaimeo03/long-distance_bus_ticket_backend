import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity('Payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'smallint', nullable: true })
    method: number;

    @Column({ type: 'bigint', nullable: true })
    amount: number;

    @Column({ type: 'date', nullable: true })
    paymentDate: Date;

    @OneToOne(() => Booking, (booking) => booking.payment)
    booking: Booking;
}