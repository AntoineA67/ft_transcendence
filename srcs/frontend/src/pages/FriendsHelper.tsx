import { UserItem } from "../utils/UserItem";
import { userType } from "../../types/user";
import { socket } from "../utils/socket";
import { ReqItem } from "../utils/ReqItem";

export function FriendList({ friends }: { friends: userType[] }) {
	const myMap = (user: userType) => {
		return (
			<li key={user.id} className='m-0 p-0'>
				<UserItem user={user} linkTo={user.username} />
			</li>
		)
	}
	return (
		<ul className='p-0 m-0'>
			{friends.map(myMap)}
		</ul>

	);
}

type FriendReqListProp = {
	reqs: userType[], 
	setReqs: React.Dispatch<React.SetStateAction<userType[]>>
}

export function FriendReqList({ reqs, setReqs }: FriendReqListProp) {

	async function handleClick(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		possibleFriendId: number,
		result: boolean
	) {
		e.preventDefault();
		socket.emit('replyReq', { other: possibleFriendId, result }, (success: boolean) => {
			if (success) {
				const update = reqs.filter((x) => (x.id != possibleFriendId))
				setReqs(update);
			}
		})
	}

	const myMap = (user: userType) => {
		return (
			<li key={user.id}>
				<ReqItem 
					user={user} 
					linkTo={user.username} 
					onAccept={(e: any) => handleClick(e, user.id,true)} 
					onDecline={(e: any) => handleClick(e, user.id, false)}/>
			</li>
		)
	}

	return (
		<ul className='p-0 m-0'>
			{reqs.map(myMap)}
		</ul>
	);
}

type BlockListProp = {
	blocks: userType[], 
}

export function BlockList({ blocks }: BlockListProp) {

	// const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
	// 	e.preventDefault();
	// 	socket.emit('unblock', id, (success: boolean) => {
	// 		if (success) {
	// 			const update = blocks.filter((x) => (x.id != id));
	// 			setBlocks(update);
	// 		}
	// 	})
	// }

	const myMap = (user: userType) => {
		return (
			<li key={user.id}>
				<UserItem user={user} linkTo={user.username} />
				{/* <button
					className='accept'
					onClick={(e) => handleClick(e, user.id)} /> */}
			</li>
		)
	}

	return (
		<ul className='p-0'>
			{blocks.map(myMap)}
		</ul>
	);
}