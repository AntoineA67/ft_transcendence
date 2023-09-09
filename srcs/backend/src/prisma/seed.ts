import { PrismaClient } from '@prisma/client'
import { users } from "./seeds/users"
import { friendships } from './seeds/friendship'
import { friendReqs } from './seeds/friendReq'
import { achieves } from './seeds/achieve'
import { rooms } from './seeds/rooms'
import { members } from './seeds/members'
import { messages } from './seeds/messages'
const prisma = new PrismaClient()

async function seeding() {
	await seedUsers();
	await seedFriendship();
	await seedFriendReq();
	await seedAchieves();
	await seedRooms();
	await seedMembers();
	await seedMessages();
}

async function seedUsers() {
	for (let user of users){
		await prisma.user.upsert({
			where: {id: user.id},
			update: {},
			create: user,
		});
	}
}

async function seedFriendship() {
	for (let friend of friendships ){
		await prisma.friendship.upsert({
			where: {id: friend.id},
			update: {},
			create: friend,
		});
	}
}

async function seedFriendReq() {
	for (let req of friendReqs ){
		await prisma.friendRequest.upsert({
			where: {id: req.id},
			update: {},
			create: req,
		});
	}
}

async function seedAchieves() {
	for (let ach of achieves ){
		await prisma.achievement.upsert({
			where: {id: ach.id},
			update: {},
			create: ach,
		});
	}
}

async function seedRooms() {
	for (let room of rooms ){
		await prisma.room.upsert({
			where: {id: room.id},
			update: {},
			create: room
		});
	}
}

async function seedMembers() {
	for (let member of members ){
		await prisma.member.upsert({
			where: {id: member.id},
			update: {},
			create: member
		});
	}
}

async function seedMessages() {
	for (let mess of messages ){
		await prisma.message.upsert({
			where: {id: mess.id},
			update: {},
			create: mess
		});
	}
}

  
//  // create two games with players  
//   const game1 = await prisma.game.create({
// 	data: {
// 		id: 1, 
// 		finish: true, 
// 		start_date: new Date(),
// 		end_date: new Date(),
// 		score: '4:3',
// 		players: {
// 			create: [
// 				{
// 					id: 1, 
// 					win: true, 
// 					userId: 1
// 				},
// 				{
// 					id: 2, 
// 					win: false,
// 					userId: 2
// 				}
// 			]
// 		}
// 	}
//   })
  
//   const game2 = await prisma.game.create({
// 	data: {
// 		id: 2, 
// 		finish: true, 
// 		start_date: new Date(),
// 		end_date: new Date(),
// 		score: '2:3',
// 		players: {
// 			create: [
// 				{
// 					id: 3, 
// 					win: false, 
// 					userId: 1
// 				},
// 				{
// 					id: 4, 
// 					win: true,
// 					userId: 2
// 				}
// 			]
// 		}
// 	}
//   })
// }


seeding()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })