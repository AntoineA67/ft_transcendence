// import '../styles/index.css'
// import '../styles/iconButton.css';

import { UserItem } from "../utils/UserItem";
import { userType } from "../../types/user";
import { friendsSocket } from "../utils/socket";
import { ReqItem } from "../utils/ReqItem";
import { useEffect, useState } from "react";

export function FriendList() {
	const [ friends, setFriends ] = useState<userType[]>([]);
	
	const findAllFriends = () => {
		friendsSocket.emit('findAllFriends', (res: userType[]) => {
			setFriends(res);
		})
	}
	const handleFriendReqAccept = (replier: userType) => {
		// console.log('handleaccept: ', replier);
		setFriends((prev) => ([...prev, replier]));
	}
	
	useEffect(() => {
		findAllFriends();
		friendsSocket.on('friendReqAccept', handleFriendReqAccept);
		friendsSocket.on('block', findAllFriends)
		friendsSocket.on('unblock', findAllFriends)
		
		return (() => {
			friendsSocket.off('friendReqAccept', handleFriendReqAccept);
			friendsSocket.off('block', findAllFriends)
			friendsSocket.off('unblock', findAllFriends)
		});
	}, [])
	
	const myMap = (user: userType) => {
		return (
			<li key={user.id} className='m-0 p-0'>
				<UserItem user={{... user}} linkTo={user.username} />
			</li>
		)
	}
	return (
		(friends.length == 0) ? (
			<h5 style={{color: 'grey'}}>Empty</h5>
		) : (
			<ul className='p-0 m-0'>
				{friends.map(myMap)}
			</ul>
		)
	);
}

export function FriendReqList() {
	const [ reqs, setReqs ] = useState<userType[]>([])

	useEffect(() => {
		friendsSocket.emit('findAllReqs', (res: userType[]) => {
			setReqs(res);
		})
		function handleReq(sender: userType) {
			setReqs((prev) => ([sender, ... prev]))
			// setReqs([...reqs, sender]);
		}
		friendsSocket.on('recvfriendReq', handleReq);
		return (() => {
			friendsSocket.off('recvfriendReq', handleReq);
		});
	}, [])
	
	async function handleClick(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		possibleFriendId: number,
		result: boolean
	) {
		e.preventDefault();
		friendsSocket.emit('replyReq', { other: possibleFriendId, result }, (success: boolean) => {
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
					user={{... user}} 
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


export function BlockList() {
	const [ blocks, setBlocks ] = useState<userType[]>([])

	useEffect(() => {
		friendsSocket.emit('findAllBlocks', (res: userType[]) => {
			setBlocks(res)
			console.log('res', res);
		})

		function handleBlock(otherUser: userType) {
			console.log('blocks', otherUser)
			setBlocks((prev) => ([... prev, otherUser]))
		}
		function handleUnblock(otherUser: userType) {			
			setBlocks((prev) => (prev.filter((x) => (x.id != otherUser.id))))
		}
		friendsSocket.on('block', handleBlock);
		friendsSocket.on('unblock', handleUnblock);
		return (() => {
			friendsSocket.off('block', handleBlock);
			friendsSocket.off('unblock', handleUnblock);
		})
	}, [])

	const myMap = (user: userType) => {
		return (
			<li key={user.id}>
				<UserItem user={{... user}} linkTo={user.username} />	
			</li>
		)
	}

	return (
		(blocks.length == 0) ? (
			<h5 style={{ color: 'grey' }}>Empty</h5>
		) : (
			<ul className='p-0'>
				{blocks.map(myMap)}
			</ul>
		)
	);
}