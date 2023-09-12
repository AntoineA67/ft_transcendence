

export const messages = [
	{
		id: 1,
		message: 'Hello!',
		// send_date: new Date(),
		user: {connect: {id: 2}},
		room: {connect: {id: 1}} 
	},
	{
		id: 2,
		message: 'Hi what are you doing!',
		// send_date: new Date(),
		user: {connect: {id: 3}},  
		room: {connect: {id: 1}} 
	},
	{
		id: 3,
		message: 'eating',
		// send_date: new Date(),
		user: {connect: {id: 1}},  
		room: {connect: {id: 1}} 
	},
	{
		id: 4,
		message: 'coucou!',
		// send_date: new Date(),
		user: {connect: {id: 1}},    
		room: {connect: {id: 2}} 
	},
	{
		id: 5,
		message: 'Im going to school',
		// send_date: new Date(),
		user: {connect: {id: 1}},  
		room: {connect: {id: 3}} 
	},
	{
		id: 6,
		message: 'ok',
		// send_date: new Date(),
		user: {connect: {id: 7}},  
		room: {connect: {id: 3}} 
	}
]