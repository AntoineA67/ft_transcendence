import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  //create four user
	const sasha = await prisma.user.create({
    data: {
		id: 12345,
		username: 'Sasha',
		email: 'sasha@prisma.io',
		password: 'sashapass',
		bio: 'Hello guys',
    },
  });
  const kay = await prisma.user.create({
    data: {
		id: 12346,
		username: 'Kay',
		email: 'kay@prisma.io',
		password: 'kaypass',
		bio: 'Hello, good morning',
    },
  })
  const jin = await prisma.user.create({
    data: {
		id: 12347,
		username: 'Jin',
		email: 'jin@prisma.io',
		password: 'jinpass',
		bio: 'Hello coucou',
    },
  })
  const ting = await prisma.user.create({
    data: {
		id: 12348,
		username: 'Ting',
		email: 'ting@prisma.io',
		password: 'tingpass',
		bio: 'Heyyyyyyyyy',
    },
  })
  //create friendship
  const friend1 = await prisma.friendship.create({
	data: {
		id: 54321,
		friends: {
			connect: [{id: 12345}, {id: 12346}]
		}
	}
  })
  const friend2 = await prisma.friendship.create({
	data: {
		id: 54321,
		friends: {
			connect: [{id: 12345}, {id: 12347}]
		}
	}
  })
  const friend3 = await prisma.friendship.create({
	data: {
		id: 54321,
		friends: {
			connect: [{id: 12345}, {id: 12348}]
		}
	}
  })
  //a friend request
  const friendReq = await prisma.friendRequest.create({
	data: {
		id: 123321,
		user: {connect: {id: 12346}},
		possibleFriend: {connect: {id: 12347}},
		status: 'pending'
	}
  })
  
  
  //a private chat room
  const privateChatRoom = await prisma.room.create({
	data: {
		id: 9,
		isChannel: false,
		message: {
			create: [
				{
					id: 1,
					message: 'Hello!',
					send_date: new Date(),
					user: {connect: {id: 12345}},    
				},
				{
					id: 2,
					message: 'Hi what are you doing!',
					send_date: new Date(),
					user: {connect: {id: 12346}},  
				},
				{
					id: 1,
					message: 'eating',
					send_date: new Date(),
					user: {connect: {id: 12345}},  
				}
			]
		},
		members: {
			create: [
				{
					id: 123, 
					user: {connect: {id: 12345}},
				},
				{
					id: 124, 
					user: {connect: {id: 12346}},
				}
			]
		}
	}
  })
  
  const achieve = await prisma.achievement.create({
	data: {
		id: 11111,
		user: {connect: {id: 12345}}, 
		firstWin: true, 
		winTenGames: true,
		loggedAWeek: true
	}
  })
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })