import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { BlockService } from 'src/block/block.service';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class FriendshipService {

	private logger = new Logger('FriendService');

	constructor(
		private usersService: UsersService,
		private blockService: BlockService,
		private prisma: PrismaService
	) { }

	// return all friends of a user, id, nick, avatar, status
	// minus those that block you or those that you block
	async findAllFriends(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserById(id);
		if (!user) return ([]);
		const friendships = await this.prisma.friendship.findMany({
			where: { friends: { some: { id } } },
			include: {
				friends: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true
					}
				}
			}
		})
		let myFriends: UserDto[] = friendships.map((x) => (
			(x.friends[0].username != user.username) ? (x.friends[0]) : (x.friends[1])
		))
		const promises = await Promise.all(myFriends.map(async (x) => (
			await this.blockService.isBlocked(id, x.id) == false
			&& await this.blockService.isBlocked(x.id, user.id) == false
		)))
		myFriends = myFriends.filter((x, index) => (promises[index]))
		return (myFriends)
	}

	// return all friends of a user, id, nick, avatar, status
	// and those that block you or those that you block
	async findAllFriendsIncludeBlocks(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserById(id);
		if (!user) return ([]);
		const friendships = await this.prisma.friendship.findMany({
			where: { friends: { some: { id } } },
			include: {
				friends: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true
					}
				}
			}
		})
		let myFriends: UserDto[] = friendships.map((x) => (
			(x.friends[0].username != user.username) ? (x.friends[0]) : (x.friends[1])
		))
		return (myFriends)
	}

	async makeFriend(id: number, otherId: number): Promise<boolean> {
		const user = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserById(otherId);
		if (!user || !friend) return (false);
		const areFriends = await this.isFriend(id, otherId);
		if (areFriends) return (true);
		try {
			await this.prisma.friendship.create({
				data: {
					friends: { connect: [{ id: id }, { id: otherId }] }
				}
			})
		} catch (err: any) {
			return (false)
		}
		return (true);
	}

	async unFriend(id: number, otherId: number): Promise<boolean> {
		const user = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserById(otherId);
		if (!user || !friend) return (false);
		let friendship = await this.prisma.friendship.findMany({
			where: { friends: { some: { id } } },
			include: {
				friends: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true
					}
				}
			}
		})
		friendship = friendship.filter((x) => (
			x.friends[0].id == otherId || x.friends[1].id == otherId
		))
		if (friendship.length == 0) return (true)
		for (let x of friendship) {
			try {
				await this.prisma.friendship.delete({ where: { id: x.id } })
			} catch (err: any) { };
		}
		return (true);
	}

	async isFriend(myId: number, otherId: number): Promise<boolean> {
		const user = await this.usersService.getUserById(myId);
		if (!user) return (false);
		let myFriends = await this.findAllFriendsIncludeBlocks(myId);
		myFriends = myFriends.filter((friend) => (friend.id == otherId))
		return (myFriends.length != 0 ? true : false);
	}

	// return all users that's not friends
	async getOthers(id: number): Promise<UserDto[]> {
		const all: UserDto[] = await this.usersService.getAllUsers();
		const friends: UserDto[] = await this.findAllFriendsIncludeBlocks(id);
		const others: UserDto[] = all.filter((a) => !friends.map(f => f.id).includes(a.id));
		return (others.filter((x) => (x.id != id)));
	}

}
