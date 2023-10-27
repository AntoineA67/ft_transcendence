import { Link, Outlet, useLocation, useLoaderData } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { userType } from '../../types/user';
import { socket } from '../utils/socket';
import { UserItem } from '../utils/UserItem';
// import '../styles/index.css';

export function SearchBar() {
	const users = useLoaderData() as userType[];
	const [search, setSearch] = useState('');
	const [list, setList] = useState(users);
	const [temp, setTemp] = useState(users);
	
	// useEffect(() => {
	// 	console.log('searchbar: ')
	// 	socket.emit('getAllUsers', (response: userType[]) => {
	// 		setList(response)
	// 		setTemp(response);
	// 	})
	// }, [])

	useEffect(() => {
		const myFilter = (item: userType): boolean => {
			return (item.username.toLowerCase().includes(search.toLowerCase()))
		}
		setTemp(list.filter(myFilter));
	}, [search])
	
	const myMap = (item: userType) => {
		return (
			<li key={item.id} className='p-0 m-0 w-100'>
				<UserItem 
					user={{...item}}
					linkTo={`${item.username}`}/>
			</li>
		)
	}
	
	return (
		<div className='d-flex flex-column align-items-center p-0 m-0 w-100' >
			<div className='py-2 px-3 w-100'>
				<input 
					value={search} 
					onChange={(e) => {setSearch(e.target.value)}}
					type="text" 
					placeholder='Search by username'
					autoFocus
					className="w-100"
				/>
			</div>
			{temp.length ? (
				<ul className='p-0 m-0 w-100 pb-5 mb-5'>
					{temp.map(myMap)}
				</ul>
			) : (
				<h5 className='p-3 grey-text'>No result</h5>
			)}
		</div>
	);
}

export function Search() {
	const location = useLocation();
	const classname1 = location.pathname == '/search' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname == '/search' ? 'd-none d-sm-flex' : '';
	
	return (
		<div className='container-fluid h-100' >
			<div className='row h-100' >
				<div className={`overflow-y-auto col-12 col-sm-4 p-0 m-0 h-100 ${classname1}`}>
					<SearchBar />
				</div>
				<div className={`overflow-y-auto col-12 col-sm-8 p-0 m-0 h-100 ${classname2}`}>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

	