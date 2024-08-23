import { Entity, JoinColumn, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity('Bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'boolean', nullable: true })
    paymentStatus: boolean;

    @Column({ type: 'boolean', nullable: true })
    bookingStatus: boolean;

    @Column({ type: 'integer', nullable: true })
    quantity: number;

    @ManyToOne(() => User, (user) => user.bookings)
    user: User;

    @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
    schedule: Schedule;

    @Column({ type: 'date', nullable: true })
    bookingDate: Date;

    @OneToOne(() => Payment, (payment) => payment.booking)
    @JoinColumn()
    payment: Payment;
}