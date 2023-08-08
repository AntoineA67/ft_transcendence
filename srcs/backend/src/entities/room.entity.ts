import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'room' })
export class Room {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        length: 255,
    })
    public title: string;

    @Column({ nullable: false })
    public private: boolean;

    @Column({ nullable: true, length: 100 })
    public password: string | null;

    @ManyToOne(() => User)
    public owner: User;
}
