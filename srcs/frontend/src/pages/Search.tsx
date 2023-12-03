import { Outlet, useLocation, useLoaderData } from "react-router-dom";
import { useEffect, useState } from 'react';
import { userType } from '../../types/user';
import { UserItem } from '../utils/UserItem';

export function SearchBar() {
	const users = useLoaderData() as userType[];
	const [search, setSearch] = useState('');
	const [temp, setTemp] = useState(users);

	useEffect(() => {
		const myFilter = (item: userType): boolean => {
			return (item.username.toLowerCase().includes(search.toLowerCase()))
		}
		setTemp(users.filter(myFilter));
	}, [search])

	const myMap = (item: userType) => {
		return (
			<li key={item.id} className='p-0 m-0 w-100'>
				<UserItem
					user={{ ...item }}
					linkTo={`${item.username}`} />
			</li>
		)
	}

	return (
		<div className='d-flex flex-column align-items-center p-0 m-0 w-100' >
			<div className='py-2 px-3 w-100'>
				<input
					value={search}
					onChange={(e) => {
						if (e.target.value.length < 20)
							setSearch(e.target.value)
					}}
					placeholder='Search by username'
					autoFocus
				/>
			</div>
			{!search && <h5 className='p-3 grey-text'>Type something</h5>}
			{(search && temp.length === 0) && <h5 className='p-3 grey-text'>No result</h5>}
			{(search && temp.length > 0) &&
				<ul className='p-0 m-0 w-100 pb-5 mb-5'>
					{temp.map(myMap)}
				</ul>
			}
			{/* {(temp.length && search) ? (
				<ul className='p-0 m-0 w-100 pb-5 mb-5'>
					{temp.map(myMap)}
				</ul>
			) : (
				search ? (<h5 className='p-3 grey-text'>No result</h5>)
				: (<h5 className='p-3 grey-text'>Type something</h5>)
				
			)} */}
		</div>
	);
}

export function Search() {
	const location = useLocation();
	const classname1 = location.pathname === '/search' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname === '/search' ? 'd-none d-sm-flex' : '';

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

