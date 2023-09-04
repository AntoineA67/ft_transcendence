import { createContext, ReactComponentElement, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {  useParams } from 'react-router-dom';


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

export function AuthProvider({children}: any) {
	const [auth, setAuth] = useState<any>(null);

	return (
		<AuthContext.Provider value={{auth, setAuth}}>
			{children}
		</AuthContext.Provider>
	);
}

export function CallBack42() {
	const { auth, setAuth } = useContext(AuthContext);
	const {code, state} =  useParams();
	
	const api42_continue = async() => {
		// if user is connected, do nothing
		if (auth?.id) return ;
		// user is not connected, and didn't come from redirection, or state doesn't match
		if (!code || !state) return ;
		if (state != auth?.state) {
			console.log('state not match');
			return ;
		}
		//send code to back
		try {
			const response = await fetch('send to url at back, with code');
			if (!response.ok) throw new Error('response not ok');
			const data = await response.json();
			//setAuth with response
			//create websocket
		} catch (error: any) {
			console.log('api42_continue fails: ', error);
			console.log('code:', code, 'state: ', state);
		}
	}
	useEffect(() => {api42_continue()}, []);
	
	return (
		<Navigate to='/' replace={true} />	
	);
}

export function Protected({children}: any) {
	const { auth } = useContext(AuthContext);
	
	return (
		auth?.id ? (
			<Outlet />
		) : (
			<Navigate to="/login" replace={true}/>
		)
	);
}