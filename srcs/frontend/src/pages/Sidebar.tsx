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
	const [nickname, setNickname] = useState('Intelligent Seagul');
	const [bio, setBio] = useState('Gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	const [avatar, setAvatar] = useState('../assets/Friend.svg');

	const fetchUser = async () => {
		//fetch
	}

	useEffect(() => {
		fetchUser();
	}, []);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		const clicked = e.currentTarget as HTMLElement;
		const sidebar = document.getElementById('sidebar-ul');
		if (sidebar == null) return;
		let item: HTMLElement | null = sidebar.firstChild as HTMLElement;

		while (item) {
			item.classList.remove("active");
			item = item.nextSibling as HTMLElement;
		}
		clicked.classList.add("active");
	}

	return (
		<div className="container-fluid">
			<div className="row">
				
				<div className="col-sm min-vh-100"> 
					<Outlet context={{
						nickname, bio, avatar, setNickname, setBio, setAvatar
					} satisfies userContext} />
				</div>

				<div className="col-sm-auto sticky-bottom order-sm-first" style={{backgroundColor: "black"}}>
					<ul className="nav navbar navbar-expand flex-sm-column justify-content-around gap-sm-4" 
						id="sidebar-ul" role="navigation" >
						<li className='nav-item' onClick={handleClick}>
							<Link to="."><img src={Home} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="."><img src={Search} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="."><img src={Friend} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="."><img src={Chat} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="."><img src={Game} /></Link>
						</li>
					</ul>
				</div>

			</div>
		</div>


		// <>

			// <ul className="nav navbar navbar-expand flex-sm-column justify-content-around" id="sidebar-ul" role="">
			// 	<li className='nav-item active' onClick={handleClick}>
			// 		<Link to="."><img src={Home}/></Link>
			// 	</li>
			// 	<li  className="nav-item" onClick={handleClick}>
			// 		<Link to="."><img src={Search} /></Link>
			// 	</li>
			// 	<li className="nav-item" onClick={handleClick}>
			// 		<Link to="."><img src={Friend} /></Link>
			// 	</li>
			// 	<li className="nav-item" onClick={handleClick}>
			// 		<Link to="."><img src={Chat} /></Link>
			// 	</li>
			// 	<li className="nav-item" onClick={handleClick}>
			// 		<Link to="."><img src={Game} /></Link>
			// 	</li>
			// </ul>


		// 	<Outlet context={{ nickname, bio, avatar, setNickname, setBio, setAvatar
		//  		} satisfies userContext}/>
		// </>


		// <div className="scrollbar d-flex" >
		// 	<div className="sidebar">
		// 		<nav className="navbar navbar-nav">
		// 			<ul id="sidebar-ul" className="ps-0">
		// 				<li className='sidebar-item sidebar-item-magenta' onClick={handleClick}>
		// 					<Link to="."><img src={Home}/></Link>
		// 				</li>
		// 				<li className='sidebar-item' onClick={handleClick}>
		// 					<Link to="."><img src={Search} /></Link>
		// 				</li>
		// 				<li className='sidebar-item' onClick={handleClick}>
		// 					<Link to="."><img src={Friend} /></Link>
		// 				</li>
		// 				<li className='sidebar-item' onClick={handleClick}>
		// 					<Link to="."><img src={Chat} /></Link>
		// 				</li>
		// 				<li className='sidebar-item' onClick={handleClick}>
		// 					<Link to="."><img src={Game} /></Link>
		// 				</li>
		// 			</ul>
		// 		</nav>
		// 	</div>
			// <Outlet context={{ nickname, bio, avatar, setNickname, setBio, setAvatar 
			// 	} satisfies userContext}/>
		// </div>
	);
}

export function useUser() {
	return useOutletContext<userContext>();
}