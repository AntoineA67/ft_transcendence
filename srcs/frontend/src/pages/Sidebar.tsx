import { useState, useEffect } from 'react';
import { gamesSocket } from '../utils/socket';
import { PongedPopup, PongPopup } from './Popups';

import Game from '../assets/Game.svg';
import Chat from '../assets/Chat.svg';
import Me from '../assets/Me.svg';
import Search from '../assets/Search.svg';
import Friend from '../assets/Friend.svg';


import { SnackbarProvider } from "notistack";

import { Outlet, Link, useLocation } from "react-router-dom";

export default function Sidebar() {
	const location = useLocation();
	const pages = ['/', '/me', '/search', '/friends', '/chat'];
	const [page, setPage] = useState<string>();
	const [popup, setPopup] = useState<'no' | 'pong' | 'ponged'>('no');
	const [popupNick, setPopupNick] = useState('');
	const [popupId, setpopupId] = useState('');

	useEffect(() => {
		const path = location.pathname;
		for (let i in pages) {
			path.startsWith(pages[i]) && setPage(pages[i])
		}
	}, [location])

	useEffect(() => {

		function handlePong(nick: string) {
			setPopupNick(nick);
			setPopup('ponged')
		}

		function handlePonged({ nick, id }: { nick: string, id: string }) {
			setPopupNick(nick);
			setpopupId(id);
			setPopup('ponged')
		}

		gamesSocket.on('ponged', handlePonged);
		gamesSocket.on('pong', handlePong);

		return (() => {
			gamesSocket.off('ponged', handlePonged);
			gamesSocket.off('pong', handlePong);
		})

	}, [])

	return (
		<>
			<SnackbarProvider
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				maxSnack={2}
				dense
				autoHideDuration={2500}
				preventDuplicate
			>
				<div className="container-fluid">
					<div className="row">
						<div className="col-sm vh-100 overflow-auto p-0 pb-5" >
							<Outlet />
						</div>
						<div className="col-sm-auto sticky-bottom order-sm-first bg-black">
							<ul className="nav navbar navbar-expand flex-sm-column justify-content-around gap-sm-4" id="sidebar-ul" role="navigation">
								<li className={`nav-item ${page === '/' ? 'magenta' : ''}`}>
									<Link to="/"><img src={Game} alt="Game" /></Link>
								</li>
								<li className={`nav-item ${page === '/me' ? 'magenta' : ''}`}>
									<Link to="me"><img src={Me} alt="Home" /></Link>
								</li>
								<li className={`nav-item ${page === '/search' ? 'magenta' : ''}`}>
									<Link to="search"><img src={Search} alt="Search" /></Link>
								</li>
								<li className={`nav-item ${page === '/friends' ? 'magenta' : ''}`}>
									<Link to="friends"><img src={Friend} alt="Friend" /></Link>
								</li>
								<li className={`nav-item ${page === '/chat' ? 'magenta' : ''}`}>
									<Link to="chat"><img src={Chat} alt="Chat" /></Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</SnackbarProvider>
			{/* <button className='btn btn-primary' onClick={() => (setPopup('pong'))}>Pong</button>
			<button className='btn btn-primary'  onClick={() => (setPopup('ponged'))}>Ponged</button> */}
			{popup === 'pong' && <PongPopup nick={popupNick} popupId={popupId} setPopup={setPopup} />}
			{popup === 'ponged' && <PongedPopup nick={popupNick} popupId={popupId} setPopup={setPopup} />}
		</>
	)
}