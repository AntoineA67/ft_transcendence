
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
					win: true,
				}, 
				{
					user: { connect: { username: 'Florian' } },
					win: false,
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
					win: false,
				},
				{
					user: { connect: { username: 'Florian' } },
					win: true,
				},
			]
		}
	}
]