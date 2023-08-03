import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Game {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id: number;

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @Column()
  @Field(() => String)
  public name: string;
}
