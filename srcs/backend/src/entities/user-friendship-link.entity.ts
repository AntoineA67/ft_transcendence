import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_friendship_link' })
export class UserFriendshipLink {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    public user: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'friend_id' })
    public friend: User;

    @Column({ nullable: false, default: false })
    public friendStatus: boolean;

    @Column({ nullable: false, default: false })
    public blockedStatus: boolean;
}
