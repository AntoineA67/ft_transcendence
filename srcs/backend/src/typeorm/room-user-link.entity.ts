import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity({ name: 'room_user_link' })
export class RoomUserLink {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Room, { onDelete: 'CASCADE' })
    public room: Room;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    public user: User;

    @Column({ nullable: false, default: false })
    public ownerStatus: boolean;

    @Column({ nullable: false, default: false })
    public adminStatus: boolean;

    @Column({ nullable: false, default: false })
    public banStatus: boolean;

    @Column({ nullable: false, default: false })
    public muteStatus: boolean;
}
