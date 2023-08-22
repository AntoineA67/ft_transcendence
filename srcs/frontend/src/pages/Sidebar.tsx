import '../styles/Sidebar.css'
import '../styles/index.css'

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
			<Outlet />
		</div>
	);
}