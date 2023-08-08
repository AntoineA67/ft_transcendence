// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { ObjectType, Field, ID } from '@nestjs/graphql';

// @Entity()
// @ObjectType()
// class Message {
//   @Field(() => ID)
//   @PrimaryGeneratedColumn()
//   public id: number;

//   @Field(() => String)
//   @Column()
//   public content: string;

//   @Field(() => String)
//   @CreateDateColumn()
//   createdAt: Date;
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
