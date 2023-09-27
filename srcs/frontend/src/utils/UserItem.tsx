import { Avatar } from './Avatar';
import { userType } from '../../types/user';
import { Link } from 'react-router-dom';

export function UserItem(user: userType, linkTo: string) {
	return (
		<Link to={linkTo}>
			<div>
				<Avatar size={100} user={user} />
				<p>{user.username}</p>
			</div>
		</Link>
	)
}