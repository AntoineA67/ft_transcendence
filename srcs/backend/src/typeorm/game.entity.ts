import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'game' })
export class Game {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ default: false, nullable: false })
    public status: boolean;

    @Column({ nullable: false })
    public start_date: Date;

    @Column({ nullable: true })
    public end_date: Date;

    @ManyToOne(() => User, { nullable: true })
    public winner: User;

    @Column({ nullable: true })
    public score: string;
}
