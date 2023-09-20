import {useEffect, useState} from 'react';
import { socket } from '../utils/socket';

type Other = {
	id: number,
	username: string,
	avatar: null,
	onlineStatus: 'ONLINE' | 'OFFLINE' | 'INGAME',
}

function FriendList({friends} : {friends: Other[]}) {
	
	const myMap = (item: Other) => {
		return (
			<li key={item.id}>
				{item.username}
			</li>
		)
	}

	return (
		<ul>
			<p style={{color: 'white'}}>FriendList</p>
			{(friends.length == 0) ? (
				<p style={{ color: 'white' }}>
					Nothing
				</p>
			) : (
				friends.map(myMap))}
		</ul>
	);
}

function FriendReqList({ reqs, setReqs }: { reqs: any[], setReqs: React.Dispatch<React.SetStateAction<Other[]>> }) {

	async function handleClick(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
		possibleFriend: string, 
		result: boolean
	) {
		e.preventDefault();
		socket.emit('replyReq', {nick: possibleFriend, result}, (success: boolean) => {
			if (success) {
				const update = reqs.filter((x) => (x.user.username != possibleFriend))
				setReqs(update);
			}
		})
		
	}
	
	const myMap = (item: any) => {
		return (
			<li key={item.id}>
				<div>
					<p style={{color: 'white'}}>
						{item.user.username}
					</p>
					<button 
						className='btn btn-primary' 
						onClick={(e) => handleClick(e, item.user.username, true)}>
						Accept
					</button>
					<button 
						className='btn btn-secondary' 
						onClick={(e) => handleClick(e, item.user.username, false)}>
						Decline
					</button>
				</div>
			</li>
		)
	}

	return (
		<ul>
			<p style={{color: 'white'}}>Friend request</p>
			{(reqs.length == 0) ? (
				<p style={{color: 'white'}}>
					Nothing
				</p> 
			): (
				reqs.map(myMap))}
		</ul>
	);
}

function SendRequest() {
	
	const [nick, setNick] = useState('');
	const [mess, setMess] = useState('mess');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		socket.emit('sendReq', nick, (success: boolean) => {
			success ? setMess('Success') : setMess('Fails')
			setNick('');
		})
	}
	
	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<label htmlFor='send-friend-request'>Send friend request</label>
			<input type='text'
				value={nick}
				onChange={(e) => setNick(e.target.value)}
				></input>
			<button type="submit" className=""> send </button>
			<div id='form-message' style={{color: 'white'}}>{mess}</div>
		</form>
	)
}

export function Friends() {
	const [friends, setFriends] = useState<Other[]>([]);
	const [reqs, setReqs] = useState<Other[]>([]);
	const [blocks, setBlocks] = useState<any[]>([]);
	
	useEffect(() => {
		socket.emit('findAllFriends', (res: Other[]) => {
			setFriends(res)
			console.log('friends: ', res)
		})
		socket.emit('findAllPendings', (res: Other[]) => {
			setReqs(res)
			console.log('reqs: ', res)
		})
		socket.emit('findAllBlocks', (res: string[]) => {
			setBlocks(res)
			console.log('blocks: ', res)
		})
	}, [])

	return (
		<div style={{color: 'white'}}>
			<SendRequest></SendRequest>
			<FriendReqList reqs={reqs} setReqs={setReqs}></FriendReqList>
			<FriendList friends={friends}></FriendList>
		</div>
	);
}

export default Friends;