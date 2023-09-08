import {useState} from 'react';

function FriendList({friends} : {friends: string[]}) {
	
	const myMap = (item: string) => {
		return (
			<li key={item}>
				{item}
			</li>
		)
	}

	return (
		<ul>
			<p style={{color: 'white'}}>FriendList</p>
			{friends.map(myMap)}
		</ul>
	);
}

function FriendReqList({ friendReq }: { friendReq: string[] }) {

	async function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, friendReqItem: string, result: boolean) {
		e.preventDefault();
		const url = '';

		const fetchObj = {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({nickname: 'user', friendReqItem: friendReqItem, result: result})
		}
		try {
			const response = await fetch(url, fetchObj)
			if (!response.ok) throw Error('response not ok');
			friendReq = friendReq.filter((x) => (x != friendReqItem))
		} catch (err: any) {
			console.log(err);
		}
		
	}
	
	const myMap = (item: string) => {
		return (
			<li key={item}>
				{item}
				<button className='btn btn-primary' onClick={(e) => handleClick(e, item, true)}>Accept</button>
				<button className='btn btn-secondary' onClick={(e) => handleClick(e, item, false)}>Decline</button>
			</li>
		)
	}

	return (
		<ul>
			<p style={{color: 'white'}}>Friend request</p>
			{friendReq.map(myMap)}
		</ul>
	);
}

function SendRequest() {
	
	const [nick, setNick] = useState('');
	const [mess, setMess] = useState('mess');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const url = '';
		const fetchObj = {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ from: 'user', to: nick })
		}
		try {
			const response = await fetch(url, fetchObj)
			if (!response.ok) throw Error('response not ok');
			setMess('Success');
		} catch (err: any) {
			console.log(err);
			setMess('Fails');
		} finally {
			setNick('');
		}
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
	//get frined list(avatar, nickname, status)
	//get pending friend request 
	const friends = ['Bird', 'Pigeon', 'Eagle', 'Woodpecker']
	const friendRequest = ['Cat', 'Bear']
	
	return (
		<div style={{color: 'white'}}>
			<SendRequest></SendRequest>
			<FriendReqList friendReq={friendRequest}></FriendReqList>
			<FriendList friends={friends}></FriendList>
		</div>
	);
}

export default Friends;