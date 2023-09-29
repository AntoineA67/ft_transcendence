import { UserItem } from "../utils/UserItem";
import { userType } from "../../types/user";
import { socket } from "../utils/socket";
import { ReqItem } from "../utils/ReqItem";
import { useEffect } from "react";


type FriendListProp = {
	friends: userType[],
	setFriends: React.Dispatch<React.SetStateAction<userType[]>>,
}
export function FriendList({ friends, setFriends }: FriendListProp) {
	
	useEffect(() => {
		// define behavior on friendReqAccept
		function handleFriendReqAccept(replier: userType) {
			setFriends([...friends, replier]);
		}

		socket.on('friendReqAccept', handleFriendReqAccept);
		return (() => {
			socket.off('friendReqAccept', handleFriendReqAccept);
		});
	}, [])
	
	
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

	useEffect(() => {
		// define behavior on new invitation
		function handleReq(sender: userType) {
			setReqs([...reqs, sender]);
		}

		socket.on('friendReq', handleReq);
		return (() => {
			socket.off('friendReq', handleReq);
		});
	}, [])
	
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
	setBlocks: React.Dispatch<React.SetStateAction<userType[]>>,
}
export function BlockList({ blocks, setBlocks }: BlockListProp) {

	

	const myMap = (user: userType) => {
		return (
			<li key={user.id}>
				<UserItem user={user} linkTo={user.username} />
				
			</li>
		)
	}

	return (
		<ul className='p-0'>
			{blocks.map(myMap)}
		</ul>
	);
}