
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
	private users = [
		{
			userId: 1,
			username: 'john',
			password: 'changeme',
			login: 'fejfefei'
		},
		{
			userId: 2,
			username: 'maria',
			password: 'guess',
			login: 'ifjeif'
		},
	];

	async findOne(login: string): Promise<User | undefined> {
		return this.users.find(user => user.login === login);
	}
	async findAll(): Promise<User[]> {
		return this.users;
	}
	async findOrCreate(login: string): Promise<User | undefined> {
		let user = this.users.find(user => user.login === login);
		if (user) return user;
		else {
			user = {
				userId: this.users.length + 1,
				login: login,
				password: 'changeme',
				username: login
			}
			this.users.push(user);
			return user;
		}
	}
}

