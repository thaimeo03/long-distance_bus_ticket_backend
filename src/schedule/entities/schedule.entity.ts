import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Route } from 'src/route/entities/route.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity('Schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    name: string;

    @Column({ type: 'boolean', nullable: true })
    positionPoint: boolean;

    @Column({ type: 'timestamp', nullable: true })
    arrivalTime: Date;

    @Column({ type: 'integer', nullable: true })
    distanceFromStartKm: number;

    @ManyToOne(() => Route, (route) => route.schedules)
    route: Route;

    @OneToMany(() => Booking, (booking) => booking.schedule)
    bookings: Booking[];
}