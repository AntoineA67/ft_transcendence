import { createContext, ReactComponentElement, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { io } from 'socket.io-client';

type auth = {
	id: string,
	nickname: string,
	avatar: string,
	token: string,
	refreshToken: string,
	state: string,
	// socket
}

export const AuthContext = createContext<any>(null);

// export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: any }) {
	const [auth, setAuth] = useState<any>({
		id: null,
		nickname: null,
		avatar: null,
		token: null,
		refreshToken: null,
		state: null,
	});

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	);
}

export function CallBack42() {
	const { auth, setAuth } = useContext(AuthContext);
	// const {code, state} =  useParams();
	let [searchParams, setSearchParams] = useSearchParams();
	const l = useLocation();
	const navigate = useNavigate();
	console.log('location', l);
	const code = searchParams.get('code');
	const state = searchParams.get('state');

	console.log(searchParams.get('code'));
	console.log(searchParams.get('state'));

	const api42_continue = async () => {
		// console.log('kugwelifuwbef');
		// console.log('state', state,'code', code);
		// if user is connected, do nothing
		if (auth?.id) return;
		// user is not connected, and didn't come from redirection, or state doesn't match
		if (!code || !state) return;
		// if (state != auth?.state) {
		// 	console.log(state);
		// 	console.log(auth)
		// 	console.log('state not match');
		// 	return;
		// }
		// send code to back
		try {
			const response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`).then(async (res) => {


				// console.log('kugwelifuwbef try try try');
				if (!res.ok) throw new Error('response not ok');
				const data = await res.json();
				console.log('data', data);
				setAuth({ ...auth, token: data, id: '1' });
				//create websocket
				localStorage.setItem('token', data); // add this line to set the token in localStorage
				navigate("/");
				// return;
			}
			);
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

export function Protected({ children }: any) {
	const { auth } = useContext(AuthContext);
	const token = localStorage.getItem('token');
	const socket = io('ws://localhost:3000', {
		auth: { token: token },
		transports: ['websocket']
	});

	useEffect(() => {
		
		function onConnect() {
			console.log('connect')
		}
		
		function onDisconnect() {
			console.log('disconnect')
		}

		function onError(err: any) {
			console.log('err', err)
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
		token ? (
			<Outlet />
		) : (
			<Navigate to="/login" replace={true} />
		)
	);
}