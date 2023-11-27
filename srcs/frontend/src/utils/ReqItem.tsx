import { Avatar } from './Avatar';
import { userType } from '../../types/user';
import { Link } from 'react-router-dom';

type ReqItemProp = {
	user: userType,
	linkTo: string,
	onAccept: any,
	onDecline: any,
}

export function ReqItem({ user, linkTo, onAccept, onDecline }: ReqItemProp) {
	return (
		<div
			className='userItem d-flex flex-row align-items-center'>
			<Link to={linkTo}>
				<Avatar size={40} user={{...user}} />
			</Link>
			<p className='m-0 ms-3 white-text'>
				{user.username}
				 {/* <br /> send you a friend request */}
			</p>
			<button className='ms-auto decline' onClick={onDecline}/>
			<button className='ms-1 accept' onClick={onAccept}/>
		</div>
	)
}