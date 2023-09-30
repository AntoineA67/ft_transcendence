import { UserItem } from "../utils/UserItem";
import { userType } from "../../types/user";
import { socket } from "../utils/socket";
import { ReqItem } from "../utils/ReqItem";
import { useEffect, useState } from "react";

export function FriendList() {
	const [ friends, setFriends ] = useState<userType[]>([]);
	
	const findAllFriends = () => {
		socket.emit('findAllFriends', (res: userType[]) => {
			setFriends(res);
		})
	}
	const handleFriendReqAccept = (replier: userType) => {
		console.log('handleaccept: ', replier);
		setFriends((prev) => ([...prev, replier]));
	}
	
	useEffect(() => {
		findAllFriends();
		socket.on('friendReqAccept', handleFriendReqAccept);
		socket.on('block', findAllFriends)
		socket.on('unblock', findAllFriends)
		
		return (() => {
			socket.off('friendReqAccept', handleFriendReqAccept);
			socket.off('block', findAllFriends)
			socket.off('unblock', findAllFriends)
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
		socket.emit('findAllReqs', (res: userType[]) => {
			setReqs(res);
		})
		function handleReq(sender: userType) {
			setReqs((prev) => ([... prev, sender]))
			// setReqs([...reqs, sender]);
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


export function BlockList() {
	const [ blocks, setBlocks ] = useState<userType[]>([])

	useEffect(() => {
		socket.emit('findAllBlocks', (res: userType[]) => {
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
		socket.on('block', handleBlock);
		socket.on('unblock', handleUnblock);
		return (() => {
			socket.off('block', handleBlock);
			socket.off('unblock', handleUnblock);
		})
	}, [])

	const myMap = (user: userType) => {
		return (
			<li key={user.id}>
				<UserItem user={user} linkTo={user.username} />	
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