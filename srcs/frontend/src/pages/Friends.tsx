import {useEffect, useState} from 'react';
import { socket } from '../utils/socket';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { userType } from '../../types/user';
import { BlockList, FriendList } from './FriendsHelper';
import { FriendReqList } from './FriendsHelper';
import { Block } from '@react-three/fiber/dist/declarations/src/core/utils';


type AddPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
}
function AddPage({ setPage }: AddPageProp) {
	const [nick, setNick] = useState('');
	const [mess, setMess] = useState('');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		socket.emit('sendReq', nick, (success: boolean) => {
			success ? setMess('Success') : setMess('Fails')
			setNick('');
		})
	}
	
	return (
		<div>
			<button className='goBack' onClick={() => setPage('friendPage')}/>		
			<form onSubmit={(e) => handleSubmit(e)} className='p-3'>			
				<label htmlFor='send-friend-request' className="form-label" >Send friend request</label>
				<input 
					autoFocus
					className='form-control w-100 my-2'
					type='text'
					value={nick}
					onChange={(e) => setNick(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary w-100"> send </button>
				<div id='form-message mt-1' style={{color: 'white'}}>{mess}</div>
			</form>
		</div>
	)
}

type FriendPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
	friends: userType[],
	reqs: userType[],
	setReqs: React.Dispatch<React.SetStateAction<userType[]>>,
}
function FriendPage({ setPage, friends, reqs, setReqs }: FriendPageProp) {
	return (
		<>
			<div className='w-100 p-1 d-flex flex-row align-items-center' style={{background: 'black'}}>
				<button className='block me-auto' onClick={() => setPage('blockPage')}/>
				<h5 style={{color: 'white'}}>Friends</h5>
				<button className='addFriend ms-auto' onClick={() => setPage('addPage')}/>
			</div>
			<FriendReqList reqs={reqs} setReqs={setReqs} />
			<FriendList friends={friends} />
		</>
	)
}

type BlockPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
	blocks: userType[],
}
function BlockPage({ setPage, blocks }: BlockPageProp) {
	return (
		<>
			<div className='d-flex flex-row align-items-center' style={{backgroundColor: 'black'}}>
				<button 
					className='goBack m-2' 
					onClick={() => setPage('friendPage')}
				/>
				<h5 style={{color: 'white'}}>Blocks</h5>
			</div>
			<BlockList blocks={blocks}/>
		</>
	)
}


type RelationsProp = {
	friends: userType[],
	setFriends: React.Dispatch<React.SetStateAction<userType[]>>,
	reqs: userType[],
	setReqs: React.Dispatch<React.SetStateAction<userType[]>>,
	blocks: userType[],
	setBlocks: React.Dispatch<React.SetStateAction<userType[]>>,
}
function RelationPages(prop: RelationsProp) {
	const [page, setPage] = useState<'friendPage' | 'blockPage' | 'addPage'>('friendPage');

	return (
		<div className='w-100'>
			{page == 'friendPage' && <FriendPage 
				setPage={setPage}
				friends={prop.friends}
				reqs={prop.reqs}
				setReqs={prop.setReqs}
			/>}
			{page == 'blockPage' && <BlockPage 
				setPage={setPage} 
				blocks={prop.blocks} 
			/>}
			{page == 'addPage' && <AddPage setPage={setPage}/>}
		</div>
	)
}


export function Friends() {
	const location = useLocation();
	const classname1 = location.pathname == '/friends' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname == '/friends' ? 'd-none d-sm-flex' : '';
	
	const [friends, setFriends] = useState<userType[]>([]);
	const [reqs, setReqs] = useState<userType[]>([]);
	const [blocks, setBlocks] = useState<userType[]>([]);
	
	useEffect(() => {
		socket.emit('findAllReqs', (res: userType[]) => {
			setReqs(res)
			console.log('reqs: ', res)
		})
		socket.emit('findAllBlocks', (res: userType[]) => {
			setBlocks(res)
			console.log('blocks: ', res)
		})
	}, [])
	
	useEffect(() => {
		socket.emit('findAllFriends', (res: userType[]) => {
			setFriends(res)
			console.log('friends: ', res)
		})
	}, [reqs, blocks])
	
	return (
		<div className='container-fluid h-100' >
			<div className='row h-100' >
				<div className={`col-12 col-sm-4 p-0 m-0 h-100 ${classname1}`}
					style={{overflowY: 'auto'}} >
					<RelationPages 
						friends={friends}
						setFriends={setFriends}
						reqs={reqs}
						setReqs={setReqs}
						blocks={blocks}
						setBlocks={setBlocks}
					/>
				</div>
				<div className={`col-12 col-sm-8 p-0 m-0 h-100 ${classname2}`}
					style={{overflowY: 'auto'}}>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default Friends;
