import { Avatar } from './Avatar';
import { userType } from '../../types/user';
import { Link } from 'react-router-dom';

type UserItemProp = {
	user: userType,
	linkTo: string,
}

export function UserItem({user, linkTo}: UserItemProp) {
	return (
		<Link to={linkTo} className='w-100 white-text'>
			<div 
				className='userItem d-flex flex-row align-items-center'>
				<Avatar size={40} user={{...user}} />
				<p className='m-0 ms-3'>{user.username}</p>
			</div>
		</Link>
	)
}