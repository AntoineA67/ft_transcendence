import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'custom' })
export class Custom {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User)
    public user: User;

    @Column({ nullable: true })
    public ball: number;

    @Column({ nullable: true })
    public puck: number;
}
