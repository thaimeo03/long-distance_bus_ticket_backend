import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bus } from 'src/bus/entities/bus.entity';

@Entity('Bus_Companies')
export class BusCompany {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    mainImage: string;

    @OneToMany(() => Bus, (bus) => bus.busCompany)
    buses: Bus[];
}