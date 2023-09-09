

export const members = [
	{
		id: 1, 
		user: {connect: {username: 'Sasha'}},
		room: {connect: {id: 1}},
		owner: false,
		admin: false,
		ban: false,
	},
	{
		id: 2, 
		user: {connect: {username: 'Florian'}},
		room: {connect: {id: 1}},
		owner: false,
		admin: false,
		ban: false,
	},
	{
		id: 3, 
		user: {connect: {username: 'Antoine'}},
		room: {connect: {id: 1}},
		owner: true,
		admin: false,
		ban: false,
	},
	{
		id: 4, 
		user: {connect: {username: 'Alric'}},
		room: {connect: {id: 1}},
		owner: false,
		admin: false,
		ban: false,
	},
	{
		id: 5, 
		user: {connect: {username: 'Sasha'}},
		room: {connect: {id: 2}}
	},
	{
		id: 6, 
		user: {connect: {username: 'Kay'}},
		room: {connect: {id: 2}}
	},
	{
		id: 7, 
		user: {connect: {username: 'Sasha'}},
		room: {connect: {id: 3}}
	},
	{
		id: 8, 
		user: {connect: {username: 'Ting'}},
		room: {connect: {id: 3}}
	}
]