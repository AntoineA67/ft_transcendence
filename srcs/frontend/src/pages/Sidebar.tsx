import '../styles/Sidebar.css';
import '../styles/index.css';

import { useState, useEffect } from 'react';

import Game from '../assets/Game.svg';
import Chat from '../assets/Chat.svg';
import Home from '../assets/Home.svg';
import Search from '../assets/Search.svg';
import Friend from '../assets/Friend.svg';

import { Outlet, useOutletContext, Link, useLocation } from "react-router-dom";

export default function Sidebar() {
	const pages = ['/', '/search', '/friends', '/chat', '/game'];
	const location = useLocation();
	const [page, setPage] = useState<string>();
		
	useEffect(() => {
		const path = location.pathname;
		for (let i in pages) {
			path.startsWith(pages[i]) && setPage(pages[i])
		}		
	}, [location])
	
	return (
		<div className="container-fluid">
			<div className="row">
				
				<div className="col-sm vh-100 overflow-auto p-0" >
					<Outlet />
				</div>
				<div className="col-sm-auto sticky-bottom order-sm-first bg-black">
					<ul className="nav navbar navbar-expand flex-sm-column justify-content-around gap-sm-4" 
						id="sidebar-ul" role="navigation" >
						<li className={`nav-item ${(page == '/') && 'magenta'}`} >
							<Link to="/"><img src={Home} /></Link>
						</li>
						<li className={`nav-item ${(page == '/search') && 'magenta'}`} >
							<Link to="search"><img src={Search} /></Link>
						</li>
						<li className={`nav-item ${(page == '/friends') && 'magenta'}`} >
							<Link to="friends"><img src={Friend} /></Link>
						</li>
						<li className={`nav-item ${(page == '/chat') && 'magenta'}`} >
							<Link to="chat"><img src={Chat} /></Link>
						</li>
						<li className={`nav-item ${(page == '/game') && 'magenta'}`} >
							<Link to="game"><img src={Game} /></Link>
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}