import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { User } from './user.entity';

@Entity({ name: 'game_user_link' })
export class GameUserLink {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Game, { onDelete: 'CASCADE' })
    public game: Game;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    public user: User;

    @Column({ nullable: false, default: true })
    public status: boolean;
}
