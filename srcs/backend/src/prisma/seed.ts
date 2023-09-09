import { PrismaClient } from '@prisma/client'
import { users } from "./seeds/users"
import { friendships } from './seeds/friendship'
import { friendReqs } from './seeds/friendReq'
import { achieves } from './seeds/achieve'
import { rooms } from './seeds/rooms'
const prisma = new PrismaClient()

async function seeding() {
	await seedUsers();
	await seedFriendship();
	await seedFriendReq();
	await seedAchieves();
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




// async function main() {
   
// 	const room1 = await prisma.room.create({
// 		data: {
// 			id: 1,
// 			isChannel: true,
// 			// owner: {connect: {id: 3}},
// 			message: {
// 				create: [
// 					{
// 						id: 1,
// 						message: 'Hello!',
// 						send_date: new Date(),
// 						user: {connect: {id: 2}},    
// 					},
// 					{
// 						id: 2,
// 						message: 'Hi what are you doing!',
// 						send_date: new Date(),
// 						user: {connect: {id: 3}},  
// 					},
// 					{
// 						id: 3,
// 						message: 'eating',
// 						send_date: new Date(),
// 						user: {connect: {id: 2}},  
// 					}
// 				]
// 			},
// 			members: {
// 				create: [
// 					{
// 						id: 1, 
// 						user: {connect: {id: 1}}
// 					},
// 					{
// 						id: 2, 
// 						user: {connect: {id: 2}}
// 					},
// 					{
// 						id: 3, 
// 						user: {connect: {id: 3}}
// 					},
// 					{
// 						id: 4, 
// 						user: {connect: {id: 4}}
// 					}
// 				]
// 			}
// 		}
// 	})
  
  
// 	const room2 = await prisma.room.create({
// 		data: {
// 			id: 2,
// 			isChannel: false,
// 			message: {
// 				create: [
// 					{
// 						id: 4,
// 						message: 'Hello!',
// 						send_date: new Date(),
// 						user: {connect: {id: 1}},    
// 					},
// 					{
// 						id: 5,
// 						message: 'Hi what are you doing!',
// 						send_date: new Date(),
// 						user: {connect: {id: 5}},  
// 					},
// 					{
// 						id: 6,
// 						message: 'eating',
// 						send_date: new Date(),
// 						user: {connect: {id: 1}},  
// 					}
// 				]
// 			},
// 			members: {
// 				create: [
// 					{
// 						id: 5, 
// 						user: {connect: {id: 1}}
// 					},
// 					{
// 						id: 6, 
// 						user: {connect: {id: 5}}
// 					}
// 				]
// 			}
// 		}
// 	})
  
  
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