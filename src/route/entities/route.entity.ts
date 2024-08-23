import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Bus } from 'src/bus/entities/bus.entity';

@Entity('Routes')
export class Route {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    startLocation: string;

    @Column({ type: 'varchar', nullable: true })
    endLocation: string;

    @Column({ type: 'integer', nullable: true })
    distanceKm: number;

    @Column({ type: 'integer', nullable: true })
    durationHours: number;

    @OneToMany(() => Schedule, (schedule) => schedule.route)
    schedules: Schedule[];

    @OneToMany(() => Bus, (bus) => bus.route)
    buses: Bus[];
}