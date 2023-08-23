import '../styles/Sidebar.css';
import '../styles/index.css';

import { useState, useEffect } from 'react';

import Game from '../assets/Game.svg';
import Chat from '../assets/Chat.svg';
import Home from '../assets/Home.svg';
import Search from '../assets/Search.svg';
import Friend from '../assets/Friend.svg';

import { Outlet, useOutletContext, Link } from "react-router-dom";

type userContext = {
	nickname: string,
	bio: string,
	avatar: string,
	setNickname: React.Dispatch<React.SetStateAction<string>>,
	setBio: React.Dispatch<React.SetStateAction<string>>,
	setAvatar: React.Dispatch<React.SetStateAction<string>>,
}

export default function Sidebar() {
	//fetch user info
	const [nickname, setNickname] = useState('Intelligent Seagul');
	const [bio, setBio] = useState('Gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	const [avatar, setAvatar] = useState('../assets/Friend.svg');

	const fetchUser = async () => {
		//fetch nickname
		//fetch bio
		//fetch avatar url
		//set all
	}

	useEffect(() => {
    	fetchUser();
	}, []);
	
	
	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		const clicked = e.currentTarget as HTMLElement;
		const sidebar = document.getElementById('sidebar-ul');
		if (sidebar == null) return ;
		let item: HTMLElement | null = sidebar.firstChild as HTMLElement;
		
		while (item) {
			item.classList.remove("sidebar-item-magenta");
			item = item.nextSibling as HTMLElement;
		}
		clicked.classList.add("sidebar-item-magenta");
	}

	return (
		<div className="scrollbar d-flex" >
			<div className="sidebar">
				<nav className="navbar navbar-nav">
					<ul id="sidebar-ul" className="ps-0">
						<li className='sidebar-item sidebar-item-magenta' onClick={handleClick}>
							<Link to="."><img src={Home}/></Link>
						</li>
						<li className='sidebar-item' onClick={handleClick}>
							<Link to="."><img src={Search} /></Link>
						</li>
						<li className='sidebar-item' onClick={handleClick}>
							<Link to="."><img src={Friend} /></Link>
						</li>
						<li className='sidebar-item' onClick={handleClick}>
							<Link to="."><img src={Chat} /></Link>
						</li>
						<li className='sidebar-item' onClick={handleClick}>
							<Link to="."><img src={Game} /></Link>
						</li>
					</ul>
				</nav>
			</div>
			<Outlet context={{ nickname, bio, avatar, setNickname, setBio, setAvatar 
				} satisfies userContext}/>
		</div>
	);
}

export function useUser() {
	return useOutletContext<userContext>();
}