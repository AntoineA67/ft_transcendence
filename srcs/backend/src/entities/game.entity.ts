// import { ObjectType, Field, ID } from '@nestjs/graphql';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   PrimaryGeneratedColumn,
// } from 'typeorm';

// @Entity()
// @ObjectType()
// export class Game {
//   @PrimaryGeneratedColumn()
//   @Field(() => ID)
//   public id: number;

//   @CreateDateColumn()
//   @Field(() => String)
//   createdAt: Date;

//   @Column()
//   @Field(() => String)
//   public name: string;
// }
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
