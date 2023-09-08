import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  //create four user
	const sasha = await prisma.user.create({
    data: {
		id: 1000,
		username: 'Sasha',
		email: 'sasha@prisma.io',
		password: 'sashapass',
		bio: 'Hello guys',
    },
  });
  
  const kay = await prisma.user.create({
    data: {
		id: 1001,
		username: 'Kay',
		email: 'kay@prisma.io',
		password: 'kaypass',
		bio: 'Hello, good morning',
    },
  })
  
  const jin = await prisma.user.create({
    data: {
		id: 1002,
		username: 'Jin',
		email: 'jin@prisma.io',
		password: 'jinpass',
		bio: 'Hello coucou',
    },
  })
  
  const ting = await prisma.user.create({
    data: {
		id: 1003,
		username: 'Ting',
		email: 'ting@prisma.io',
		password: 'tingpass',
		bio: 'Heyyyyyyyyy',
    },
  })
  
  const flo = await prisma.user.create({
    data: {
		id: 1004,
		username: 'Florian',
		email: 'florian@prisma.io',
		password: 'flopass',
		bio: 'Coucou',
    },
  });
  
  const antoine = await prisma.user.create({
    data: {
		id: 1005,
		username: 'Antoine',
		email: 'antoine@prisma.io',
		password: 'antoinepass',
		bio: 'salut',
    },
  });
  
  const alric = await prisma.user.create({
    data: {
		id: 1006,
		username: 'Alric',
		email: 'alric@prisma.io',
		password: 'alricpass',
		bio: 'ciao',
    },
  });
  
  //create friendship
  const friend1 = await prisma.friendship.create({
	data: {
		id: 2001,
		friends: {
			connect: [{id: 1000}, {id: 1001}]
		}
	}
  })
  const friend2 = await prisma.friendship.create({
	data: {
		id: 2001,
		friends: {
			connect: [{id: 1000}, {id: 1002}]
		}
	}
  })
  
  const friend3 = await prisma.friendship.create({
	data: {
		id: 2003,
		friends: {
			connect: [{id: 1000}, {id: 1003}]
		}
	}
  })
  
  //a friend request
  const friendReq = await prisma.friendRequest.create({
	data: {
		id: 3001,
		user: {connect: {id: 1000}},
		possibleFriend: {connect: {id: 1004}},
		status: 'pending'
	}
  })
  
//   //a private chat room
//   const channel = await prisma.room.create({
// 	data: {
// 		id: 4001,
// 		isChannel: true,
// 		owner: {connect: {id: 1005}},
// 		title: 'transcendence', 
// 		private: true, 
// 		password: '123',
// 		message: {
// 			create: [
// 				{
// 					id: 5001,
// 					message: 'hi where are you',
// 					send_date: new Date(),
// 					user: {connect: {id: 1000}},   
// 				},
// 				{
// 					id: 5002,
// 					message: 'At campus',
// 					send_date: new Date(),
// 					user: {connect: {id: 1005}}, 
// 				},
// 				{
// 					id: 5003,
// 					message: 'we are going to 42',
// 					send_date: new Date(),
// 					user: {connect: {id: 1006}}, 
// 				}
// 			]
// 		},
// 		members: {
// 			create: [
// 				{
// 					id: 6001, 
// 					user: {connect: {id: 1000}}
// 				},
// 				{
// 					id: 6002, 
// 					user: {connect: {id: 1004}}
// 				}, 
// 				{
// 					id: 6005, 
// 					user: {connect: {id: 1005}}
// 				},
// 				{
// 					id: 6006, 
// 					user: {connect: {id: 1006}}
// 				}
// 			]
// 		}
// 	}
//   })
  
	const privateChat = await prisma.room.create({
		data: {
			id: 4002,
			isChannel: false,
			message: {
				create: [
					{
						id: 5004,
						message: 'Hello!',
						send_date: new Date(),
						user: {connect: {id: 1000}},    
					},
					{
						id: 5005,
						message: 'Hi what are you doing!',
						send_date: new Date(),
						user: {connect: {id: 1001}},  
					},
					{
						id: 5006,
						message: 'eating',
						send_date: new Date(),
						user: {connect: {id: 1000}},  
					}
				]
			},
			members: {
				create: [
					{
						id: 6003, 
						user: {connect: {id: 1000}}
					},
					{
						id: 6004, 
						user: {connect: {id: 1001}}
					}
				]
			}
		}
	  })
  
  const achieve = await prisma.achievement.create({
	data: {
		id: 7001,
		user: {connect: {id: 1000}}, 
		firstWin: true, 
		winTenGames: true,
		loggedAWeek: true
	}
  })
  
  const game1 = await prisma.game.create({
	data: {
		id: 8001, 
		finish: true, 
		start_date: new Date(),
		end_date: new Date(),
		score: '4:3',
		players: {
			create: [
				{
					id: 9001, 
					win: true, 
					userId: 1000
				},
				{
					id: 9002, 
					win: false,
					userId: 1001
				}
			]
		}
	}
  })
  
  const game2 = await prisma.game.create({
	data: {
		id: 8002, 
		finish: true, 
		start_date: new Date(),
		end_date: new Date(),
		score: '2:3',
		players: {
			create: [
				{
					id: 9003, 
					win: false, 
					userId: 1000
				},
				{
					id: 9004, 
					win: true,
					userId: 1001
				}
			]
		}
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