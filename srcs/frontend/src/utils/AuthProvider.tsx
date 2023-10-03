import React, { createContext, ReactComponentElement, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { chatsSocket, friendsSocket, socket } from './socket';

export function CallBack42() {
	const [status, setStatus] = useState<'loading' | 'done' | '2fa'>('loading');
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const state = searchParams.get('state') || null;
	const _2fa = JSON.parse(localStorage.getItem('_2fa') || '{}');

	const cb = async () => {
		if (!code || !state) return;

		try {
			let response;
			if (_2fa?.actived === true) {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}&_2fa=${_2fa?.token}`);
			} else {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`);
			}
			const data = await response.json();
			if (data._2fa) {
				localStorage.setItem('_2fa', JSON.stringify({id: data.id, actived : true}));
				setStatus('2fa');
				return;
			}
			localStorage.setItem('token', data);
			localStorage.removeItem('_2fa');
		} catch (err: any) {
			console.log(err.message)
		}
		setStatus('done');
	}
	useEffect(() => { cb() }, []);

	return (
		<>
			{status == '2fa' && <Navigate to='/login/2fa' replace />}
			{status == 'loading' && <p style={{ color: 'white' }}> loading ... </p>}
			{status == 'done' && <Navigate to='/' replace />}
		</>
	);
}

export function Protected() {
	const [status, setStatus] = useState<'connect' | 'error' | 'loading'>('loading');

	useEffect(() => {
		socket.auth = { token: localStorage.getItem('token') };
		socket.connect();
		friendsSocket.connect();
		chatsSocket.connect();

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
			localStorage.removeItem('token');
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
			{status == 'loading' && <p style={{ color: 'white' }}> loading ... </p>}
			{status == 'connect' && <Outlet />}
			{status == 'error' && <Navigate to="/login" replace />}
		</>
	);
}