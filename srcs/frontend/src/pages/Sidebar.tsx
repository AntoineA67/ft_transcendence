import '../styles/Sidebar.css';
import '../styles/index.css';

import { useState, useEffect } from 'react';

import Game from '../assets/Game.svg';
import Chat from '../assets/Chat.svg';
import Home from '../assets/Home.svg';
import Search from '../assets/Search.svg';
import Friend from '../assets/Friend.svg';

import { Outlet, useOutletContext, Link } from "react-router-dom";

export default function Sidebar() {

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		const clicked = e.currentTarget as HTMLElement;
		const sidebar = document.getElementById('sidebar-ul');
		if (sidebar == null) return;
		let item: HTMLElement | null = sidebar.firstChild as HTMLElement;

		while (item) {
			item.classList.remove("magenta");
			item = item.nextSibling as HTMLElement;
		}
		clicked.classList.add("magenta");
	}

	return (
		<div className="container-fluid">
			<div className="row">
				
				<div className="col-sm vh-100 overflow-auto" style={{padding: "0"}}>  {/* min-vh-100 */}
					<Outlet />
				</div>
				<div className="col-sm-auto sticky-bottom order-sm-first" style={{backgroundColor: "black"}}>
					<ul className="nav navbar navbar-expand flex-sm-column justify-content-around gap-sm-4" 
						id="sidebar-ul" role="navigation" >
						<li className='nav-item' onClick={handleClick}>
							<Link to="/"><img src={Home} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="search"><img src={Search} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="friends"><img src={Friend} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="chat"><img src={Chat} /></Link>
						</li>
						<li className="nav-item" onClick={handleClick}>
							<Link to="game"><img src={Game} /></Link>
						</li>
					</ul>
				</div>

			</div>
		</div>
	)
}