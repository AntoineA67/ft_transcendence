import React, { createContext, ReactComponentElement, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { Socket } from 'socket.io-client';
import { socket } from './socket';

type auth = {
	id: string | null,
	nickname: string | null,
	socket: Socket | null,
	token: string | null,
}

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<auth>({
		id: null,
		nickname: null,
		socket: null,
		token: null,
	});

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	);
}

export function CallBack42() {
	const { auth, setAuth } = useContext(AuthContext);
	const [status, setStatus] = useState<'loading' | 'done' | '2fa'>('loading');
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const state = searchParams.get('state') || null;
	const random = localStorage.getItem('random') || null;
	const token = localStorage.getItem('token') || null;
	
	const api42_continue = async () => {
		if (!code || !state) return;
		try {
			let response;
			console.log('token: ', token);
			if (token == null) {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`);
			} else {
				response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}&token=${token}`);
			}
			if (!response.ok) throw new Error('response not ok');
			const data = await response.json();

			console.log(code);

			if (data._2fa) {
				console.log('2fa');
				setStatus('2fa');
				return;
			} else {
				localStorage.setItem('token', data); // add this line to set the token in localStorage
			}

		} catch (error: any) {
			console.log('api42_continue fails: ', error);
			console.log('code:', code, 'state: ', state);
		}
		//localStorage.removeItem('random');
		setStatus('done');
	}
	useEffect(() => { api42_continue() }, []);

	return (
		<>
			{status == '2fa' && <Navigate to='/login/2fa' replace />}
			{status == 'loading' && <p style={{color: 'white'}}> loading ... </p>}
			{status == 'done' && <Navigate to='/' replace />}
		</>
	);
}

export function Protected() {
	const { auth, setAuth } = useContext(AuthContext);
	const [ status, setStatus ] = useState<'connect' | 'error' | 'loading'>('loading');
	
	useEffect(() => {
		socket.auth = { token: localStorage.getItem('token') };
		socket.connect();

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
			socket.off('disconnect',onDisconnect);
			socket.off('connect_error', onError);
		};
	}, []);

	return (
		<>
			{status == 'loading' && <p style={{color: 'white'}}> loading ... </p>}
			{status == 'connect' && <Outlet />}
			{status == 'error' && <Navigate to="/login" replace />}
		</>
	);
}