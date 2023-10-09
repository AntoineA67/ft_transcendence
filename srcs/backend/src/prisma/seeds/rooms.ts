
export const rooms = [
	{
		// id: 1,
		isChannel: true,
		title: 'transcendance',
		private: false,
		members: {
			create: [
				{
					user: {connect: {username: 'Sasha'}}
				}, 
				{
					user: {connect: {username: 'Florian'}}
				}, 
				{
					user: {connect: {username: 'Antoine'}},
					owner: true,
				}, 
				{
					user: {connect: {username: 'Alric'}}
				},
			]
		},
		message: {
			create: [
				{
					message: 'coucou',
					user: {connect: {username: 'Florian'}}
				}, 
				{
					message: 'hi guys',
					user: {connect: {username: 'Alric'}}
				}, 
				{
					message: 'Where are you?',
					user: {connect: {username: 'Sasha'}}
				},
				{
					message: 'At campus',
					user: {connect: {username: 'Antoine'}}
				}
			]
		}

	},
	{
		// id: 2, 
		isChannel: false,
		members: {
			create: [
				{
					user: { connect: { username: 'Sasha' } }
				},
				{
					user: { connect: { username: 'Kay' } }
				},
			]
		},
		message: {
			create: [
				{
					message: 'hey',
					user: { connect: { username: 'Sasha' } }
				},
				{
					message: '???',
					user: { connect: { username: 'Kay' } }
				},
				{
					message: 'What are you doing?',
					user: { connect: { username: 'Sasha' } }
				},
				{
					message: 'Eating',
					user: { connect: { username: 'Kay' } }
				}
			]
		}
	},
	{
		// id: 3,
		isChannel: false,
		members: {
			create: [
				{
					user: { connect: { username: 'Sasha' } }
				},
				{
					user: { connect: { username: 'Ting' } }
				},
			]
		},
		message: {
			create: [
				{
					message: 'hey',
					user: { connect: { username: 'Sasha' } }
				},
				{
					message: 'hey!!!',
					user: { connect: { username: 'Ting' } }
				},
				{
					message: 'What are you doing?',
					user: { connect: { username: 'Sasha' } }
				},
				{
					message: 'Playing video',
					user: { connect: { username: 'Ting' } }
				}
			]
		}
	}
]