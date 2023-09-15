import React, { createContext, ReactComponentElement, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { io, Socket } from 'socket.io-client';
import { socket } from './socket';

type auth = {
	id: string | null,
	nickname: string | null,
	socket: Socket | null,
}

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<auth>({
		id: null,
		nickname: null,
		socket: null,
	});

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	);
}

export function CallBack42() {
	const { auth, setAuth } = useContext(AuthContext);
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const state = searchParams.get('state') || null;
	const random = localStorage.getItem('random') || null;
	
	const api42_continue = async () => {
		localStorage.removeItem('random');
		if (!code || !state || !random || state != random) return;
		try {
			const response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`);
			if (!response.ok) throw new Error('response not ok');
			const data: string = await response.json();
			// console.log('data', data);
			localStorage.setItem('token', data); // add this line to set the token in localStorage
		} catch (error: any) {
			console.log('api42_continue fails: ', error);
			console.log('code:', code, 'state: ', state);
		}
	}
	useEffect(() => { api42_continue() }, []);

	return (
		<Navigate to='/' replace={true} />
	);
}

export function Protected() {
	const { auth, setAuth } = useContext(AuthContext);
	
	useEffect(() => {
		socket.auth = { token: localStorage.getItem('token') };
		socket.connect();
		
		
		//socket io regitsre event
		function onConnect() {console.log('connect')}
		function onDisconnect() {
			console.log('reconnecting ...')
			socket.connect()
		}
		function onError(err: any) {
			console.log('err', err)
			if (err.messsage == 'token invalid') {
				localStorage.removeItem('token');
			}
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
		localStorage.getItem('token') ? (
			<Outlet />
		) : (
			<Navigate to="/login" replace={true} />
		)
	);
}