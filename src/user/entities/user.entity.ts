import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    phoneNumber: string;

    @Column({ type: 'smallint', nullable: true })
    sex: number;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'smallint', nullable: true })
    role: number;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];
}