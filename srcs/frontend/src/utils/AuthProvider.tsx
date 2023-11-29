import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { chatsSocket, friendsSocket, gamesSocket, socket } from './socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export function CallBack42() {
	const [status, setStatus] = useState<'loading' | 'done' | '2fa'>('loading');
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const _2fa = JSON.parse(localStorage.getItem('_2fa') || '{}');

	const cb = async () => {
		if (!code) {
			setStatus('done')
			return;
		};

		let response;

		try {
			if (_2fa?.activated === true) {
				response = await fetch(process.env.REACT_APP_BACKEND_URL + `/auth/42/callback?code=${code}&_2fa=${_2fa?.token}`);
			} else {
				response = await fetch(process.env.REACT_APP_BACKEND_URL + `/auth/42/callback?code=${code}`);
			}
			const data = await response.json();
			if (data._2fa) {
				localStorage.setItem('_2fa', JSON.stringify({ id: data.id, activated: true }));
				setStatus('2fa');
				return;
			}
			localStorage.setItem('token', data.token);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('firstConnexion', data.firstConnexion);
			localStorage.removeItem('_2fa');
		} catch (err: any) {
		}
		setStatus('done');
	}
	useEffect(() => { cb() }, []);

	return (
		<>
			{status === '2fa' && <Navigate to='/login/2fa' replace />}
			{status === 'loading' && (
				<div style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
					<FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '0.5rem' }} />
					Loading...
				</div>
			)}
			{status === 'done' && <Navigate to='/' replace />}
		</>
	);
}

export function Protected() {
	// const [status, setStatus] = useState<'connect' | 'error' | 'loading'>('loading');
	const [ready, setReady] = useState<boolean>(false)
	const [err, setErr] = useState<boolean>(false)
	
	const [mainConnect, setMainConnect] = useState<boolean>(false)
	const [friendConnect, setFriendConnect] = useState<boolean>(false)
	const [chatConnect, setChatConnect] = useState<boolean>(false)
	const [gameConnect, setGameConnect] = useState<boolean>(false)

	
	// const connectedSockets = useRef<number>(0);

	useEffect(() => {
		const token = localStorage.getItem('token');
		
		socket.auth = { token: token };
		friendsSocket.auth = { token: token };
		chatsSocket.auth = { token: token };
		gamesSocket.auth = { token: token };
		
		socket.connect();
		friendsSocket.connect();
		chatsSocket.connect();
		gamesSocket.connect();
		//socket io regitsre event
		// function onConnect() {
		// 	connectedSockets.current += 1;
		// 	console.log('connectedsocket: ', connectedSockets)
		// 	setStatus('loading')
		// 	if (connectedSockets.current >= 4) {
		// 		setStatus('connect')
		// 	}
		// }
		// function onDisconnect() {
		// 	socket.connect()
		// }
		function onError(err: any) {
			setErr(true)
		}
		function onDisconnect() {
			socket.connect()
		}
		function onMainConnect() {
			setMainConnect(true)
		}
		function onFriendConnect() {
			setFriendConnect(true)
		}
		function onChatConnect() {
			setChatConnect(true)
		}
		function onGameConnect() {
			setGameConnect(true)
		}
		socket.on('connect', onMainConnect);
		friendsSocket.on('connect', onFriendConnect);
		chatsSocket.on('connect', onChatConnect);
		gamesSocket.on('connect', onGameConnect);
		
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onError);
		return () => {
			socket.off('connect', onMainConnect);
			friendsSocket.off('connect', onFriendConnect);
			chatsSocket.off('connect', onChatConnect);
			gamesSocket.off('connect', onGameConnect);
			
			socket.off('disconnect', onDisconnect);
			socket.off('connect_error', onError)
		};
	}, []);
	
	useEffect(() => {
		if (mainConnect && friendConnect && chatConnect && gameConnect) {
			setReady(true)
		}
	}, [mainConnect, friendConnect, chatConnect, gameConnect])

	return (
		<>
			{!ready && !err && <p className='white-text'> loading ... </p>}
			{ready && !err && <Outlet />}
			{err && <Navigate to="/login" replace />}
		</>
	);
}