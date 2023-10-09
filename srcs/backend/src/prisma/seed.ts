import { PrismaClient } from '@prisma/client'
import { users } from "./seeds/users"
import { friendships } from './seeds/friendship'
import { friendReqs } from './seeds/friendReq'
import { achieves } from './seeds/achieve'
import { rooms } from './seeds/rooms'
import { games } from './seeds/games'
const prisma = new PrismaClient()

async function seeding() {
	await seedUsers();
	// await seedFriendship();
	await seedFriendReq();
	await seedAchieves();
	await seedRooms();
	await seedGames();
}

async function seedUsers() {
	for (let user of users){
		await prisma.user.create({
			data: user
		});
	}
}

// async function seedFriendship() {
// 	for (let friend of friendships ){
// 		await prisma.friendship.upsert({
// 			where: {id: friend.id},
// 			update: {},
// 			create: friend,
// 		});
// 	}
// }

async function seedFriendReq() {
	for (let req of friendReqs ){
		await prisma.friendRequest.create({
			data: req
		});
	}
}

async function seedAchieves() {
	for (let ach of achieves ){
		await prisma.achievement.create(
			{data: ach}
		);
	}
}

async function seedRooms() {
	for (let room of rooms ){
		await prisma.room.create({
			data: room
		});
	}
}

async function seedGames() {
	for (let game of games ) {
		await prisma.game.create({
			data: game
		});
	}
}

seeding()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })