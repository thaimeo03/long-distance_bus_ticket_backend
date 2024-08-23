import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { BusCompany } from 'src/bus-company/entities/bus-company.entity';
import { Route } from 'src/route/entities/route.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Entity('Buses')
export class Bus {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true })
    busNumber: string;

    @Column({ type: 'varchar', nullable: true })
    name: string;

    @Column({ type: 'boolean', nullable: true })
    status: boolean;

    @Column({ type: 'text', nullable: true })
    mainImage: string;

    @ManyToOne(() => BusCompany, (busCompany) => busCompany.buses)
    busCompany: BusCompany;

    @OneToMany(() => Seat, (seat) => seat.bus)
    seats: Seat[];

    @ManyToOne(() => Route, (route) => route.buses)
    route: Route;
}