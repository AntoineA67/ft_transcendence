import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity({ name: 'message' })
export class Message {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Room)
    public room: Room;

    @ManyToOne(() => User)
    public user: User;

    @Column({ nullable: false })
    public message: string;

    @Column({ nullable: false })
    public send_date: Date;
}
