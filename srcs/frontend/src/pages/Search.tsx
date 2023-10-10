import '../styles/ProfileSetting.css';
import Container from 'react-bootstrap/Container';
import { Link, Outlet, useLocation } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { userType } from '../../types/user';
import { socket } from '../utils/socket';
import { UserItem } from '../utils/UserItem';

export function SearchBar() {
	const [search, setSearch] = useState('');
	const [list, setList] = useState<userType[]>([]);
	
	useEffect(() => {
		socket.emit('getAllUsers', (response: userType[]) => {
			setList(response)
		})
	}, [])

	const myMap = (item: userType) => {
		return (
			<li key={item.id} className=''>
				<UserItem 
					user={{... item}}
					linkTo={`${item.username}`}/>
			</li>
		)
	}

	return (
		<div className='d-flex flex-column align-items-center p-0 m-0' style={{ backgroundColor: "grey" }}>
			<Form.Control type="text" placeholder="Search anything"/>
			<ul style={{ listStyleType: 'none' }} className='p-0 m-0'>
				{list.map(myMap)}
			</ul>
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
				<div className={`col-12 col-sm-4 p-0 m-0 h-100 ${classname1}`}
					style={{ overflowY: 'auto' }} >
					<SearchBar />
				</div>
				<div className={`col-12 col-sm-8 p-0 m-0 h-100 ${classname2}`}
					style={{ overflowY: 'auto' }}>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

	