// import '../styles/index.css'

import {useEffect, useState} from 'react';
import { friendsSocket } from '../utils/socket';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { BlockList, FriendList } from './FriendsHelper';
import { FriendReqList } from './FriendsHelper';

type AddPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
}
function AddPage({ setPage }: AddPageProp) {
	const [nick, setNick] = useState('');
	const [mess, setMess] = useState('');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		friendsSocket.emit('sendReq', nick, (success: boolean) => {
			success ? setMess('Success') : setMess('Fails')
			setNick('');
		})
	}
	
	return (
		<div>
			<button className='leftArrow m-2' onClick={() => setPage('friendPage')}/>		
			<form onSubmit={(e) => handleSubmit(e)} className='p-3'>			
				<label htmlFor='send-friend-request'>Send friend request</label>
				<input 
					autoFocus
					className='w-100 my-2'
					type='text'
					value={nick}
					onChange={(e) => setNick(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary w-100"> send </button>
				<div id='form-message mt-1' className='white-text'>{mess}</div>
			</form>
		</div>
	)
}

type FriendPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
}
function FriendPage({ setPage }: FriendPageProp) {
	return (
		<>
			<div className='w-100 p-1 d-flex flex-row align-items-center bg-black'>
				<button className='block me-auto' onClick={() => setPage('blockPage')}/>
				<h5 className='white-text'>Friends</h5>
				<button className='addFriend ms-auto' onClick={() => setPage('addPage')}/>
			</div>
			<FriendReqList />
			<FriendList />
		</>
	)
}

type BlockPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
}
function BlockPage({ setPage }: BlockPageProp) {
	return (
		<>
			<div className='d-flex flex-row align-items-center bg-black'>
				<button 
					className='leftArrow m-2' 
					onClick={() => setPage('friendPage')}
				/>
				<h5 className='white-text'>Blocks</h5>
			</div>
			<BlockList />
		</>
	)
}

function RelationPages() {
	const [page, setPage] = useState<'friendPage' | 'blockPage' | 'addPage'>('friendPage');

	return (
		<div className='w-100'>
			{page == 'friendPage' && <FriendPage 
				setPage={setPage}
			/>}
			{page == 'blockPage' && <BlockPage 
				setPage={setPage}
			/>}
			{page == 'addPage' && <AddPage setPage={setPage}/>}
		</div>
	)
}

export function Friends() {
	const location = useLocation();
	const classname1 = location.pathname == '/friends' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname == '/friends' ? 'd-none d-sm-flex' : '';
	
	return (
		<div className='container-fluid h-100' >
			<div className='row h-100' >
				<div className={`overflow-y-auto col-12 col-sm-4 p-0 m-0 h-100 ${classname1}`}>
					<RelationPages />
				</div>
				<div className={`overflow-y-auto col-12 col-sm-8 p-0 m-0 h-100 ${classname2}`}>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default Friends;
