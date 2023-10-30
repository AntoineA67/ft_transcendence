import { Result } from '@prisma/client';
export const games = [
	{
		finish: true,
		start_date: new Date(),
		end_date: new Date(),
		score: '4:3',
		players: {
			create: [
				{
					user: { connect: { username: 'Sasha' } },
					win: Result.WIN,
				},
				{
					user: { connect: { username: 'Florian' } },
					win: Result.LOSE,
				},
			]
		}
	},
	{
		finish: true,
		start_date: new Date(),
		end_date: new Date(),
		score: '2:3',
		players: {
			create: [
				{
					user: { connect: { username: 'Sasha' } },
					win: Result.LOSE,
				},
				{
					user: { connect: { username: 'Florian' } },
					win: Result.WIN,
				},
			]
		}
	}
]