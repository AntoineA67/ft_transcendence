import { useEffect, useState } from 'react';
import { friendsSocket } from '../utils/socket';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { BlockList, FriendList } from './FriendsHelper';
import { FriendReqList } from './FriendsHelper';
import { userType } from '../../types/user';
import { UserItem } from '../utils/UserItem';

type AddPageProp = {
	setPage: React.Dispatch<React.SetStateAction<'friendPage' | 'blockPage' | 'addPage'>>,
}
function AddPage({ setPage }: AddPageProp) {
	const [search, setSearch] = useState('');
	const [list, setList] = useState<userType[]>([]);

	useEffect(() => {
		friendsSocket.emit('findOthers', (res: userType[]) => {
			setList(res);
		})
	}, [])

	const myFilter = (user: userType) => {
		return (user.username.toLowerCase().includes(search.toLowerCase()))
	}

	const myMap = (user: userType) => {
		return (
			<li key={user.id} className='m-0 p-0'>
				<UserItem user={{ ...user }} linkTo={user.username} />
			</li>
		)
	}

	return (
		<div>
			<button className='leftArrow m-2' onClick={() => setPage('friendPage')} />
			<div className='px-3 py-3'>
				<input
					autoFocus
					placeholder='Search for new friends'
					value={search}
					onChange={(e) => { setSearch(e.target.value) }}
				/>
			</div>
			<ul>
				{list.filter(myFilter).map(myMap)}
			</ul>
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
				<button className='block me-auto' onClick={() => setPage('blockPage')} />
				<h5 className='white-text'>Friends</h5>
				<button className='addFriend ms-auto' onClick={() => setPage('addPage')} />
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
			{page === 'friendPage' && <FriendPage
				setPage={setPage}
			/>}
			{page === 'blockPage' && <BlockPage
				setPage={setPage}
			/>}
			{page === 'addPage' && <AddPage setPage={setPage} />}
		</div>
	)
}

export function Friends() {
	const location = useLocation();
	const classname1 = location.pathname === '/friends' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname === '/friends' ? 'd-none d-sm-flex' : '';

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
