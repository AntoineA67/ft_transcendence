import React, { useState, useEffect} from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { chatsSocket, friendsSocket, gamesSocket, socket } from './socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export function CallBack42() {
	const [status, setStatus] = useState<'loading' | 'done' | '2fa'>('loading');
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const _2fa = JSON.parse(localStorage.getItem('_2fa') || '{}');

	const cb = async () => {
		console.log('callback42');
		if (!code) {
			setStatus('done');
			return;
		}
		let response;

		try {
			if (_2fa?.activated === true) {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}&_2fa=${_2fa?.token}`);
			} else {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`);
			}
			const data = await response.json();
			console.log('data: ', data)
			if (data._2fa) {
				localStorage.setItem('_2fa', JSON.stringify({id: data.id, activated : true}));
				setStatus('2fa');
				return;
			}
			localStorage.setItem('token', data.token);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.removeItem('_2fa');
		} catch (err: any) {
			console.log('response: ', response)
			console.log(err.message)
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
	const [status, setStatus] = useState<'connect' | 'error' | 'loading'>('loading');

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
		function onConnect() {
			setStatus('connect')
			console.log('connect')
		}
		function onDisconnect() {
			console.log('reconnecting ...')
			socket.connect()
		}
		function onError(err: any) {
			setStatus('error')
			console.log('err', err)
			// if (localStorage.getItem('token')) {
				// axios.post("http://localhost:3000/auth/signout", {}, {
				// 	headers: {
				// 	'Authorization': `Bearer ${localStorage.getItem('token')}`
				// 	}
				// });
				// localStorage.removeItem('token');
			// }
			// localStorage.removeItem('random');
			// localStorage.removeItem('email');
			// localStorage.removeItem('refreshToken');
		}
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onError);
		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('connect_error', onError);
		};
	}, []);

	return (
		<>
			<Outlet />
			{/* {status == 'loading' && <p className='white-text'> loading ... </p>}
			{status == 'connect' && <Outlet />}
			{status == 'error' && <Navigate to="/login" replace />} */}
		</>
	);
}