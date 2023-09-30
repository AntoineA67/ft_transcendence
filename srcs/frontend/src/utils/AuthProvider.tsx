import React, { createContext, ReactComponentElement, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { Socket } from 'socket.io-client';
import { socket } from './socket';


const AuthData = {
	id: 0,
	_2fa: '1'
}

export const AuthContext = createContext(AuthData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const authContext: any = {};

	return (
		<AuthContext.Provider value={authContext}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;


// function Auth() {
// 	const [auh] = useContext(AuthContext);
// 	return auh;
//   }

// export function useDataContext() {
// 	return useContext(AuthContext);
// }


// export function AuthProvider({ children }: { children: React.ReactNode }) {
// 	const [auth, setAuth] = useState('');

// 	return (
// 		<AuthContext.Provider value={auth.socket}>
// 			{children}
// 		</AuthContext.Provider>
// 	);
// }

export function CallBack42() {
	//const auth = useContext(AuthContext);

	//const auth = useContext(AuthContext);

	//const [auth, setAuth] = useContext(AuthContext);



	const pif = useContext(AuthContext);




	//const auth = useContext(AuthContext);

	//const { data, setData } = useAuthContext();
	//const [auth, setAuth] = AuthProvider();
	const [status, setStatus] = useState<'loading' | 'done' | '2fa'>('loading');
	let [searchParams] = useSearchParams();
	const code = searchParams.get('code') || null;
	const state = searchParams.get('state') || null;
	const _2fa = localStorage.getItem('_2fa') || null;


	const cb = async () => {
		if (!code || !state) return;

		try {
			let response;


			//console.log('aa', data);

			//data?.setData({ _2fa: '1323', id: 32 });


			pif.id = 34;
			pif._2fa = '123';



			//console.log('bb', data);


			// if (auth?.data?._2fa === '') {
			response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}`);
			// } else {
			// 	response = await fetch(`http://localhost:3000/auth/42/callback?code=${code}&_2fa=${auth?.data?._2fa}`);
			// }
			// const data = await response.json();
			//if (data._2fa) {

			const data = await response.json();

			console.log(code);

			if (data._2fa) {
				console.log('2fa');
				setStatus('2fa');
				return;
			}

			// 	//authContext?.setAuth({ ...authContext, _2fa: "aaa" });
			// 	//authContext?.setAuth({ ...authContext, _2fa: "aaa" });
			// 	//let updatedAuth;
			// 	//updatedAuth = 
			// 	//({ ...authContext?.auth, _2fa: "aaa", id: '212112' });
			// 	//auth?.setData({ _2fa: '32923');

			// 	// set data on auth?data context
			// 	//auth?.setData({ ...auth?.data, _2fa: '11', id: 1 });



			// 	console.log("asasassaas", auth?.data);
			//	setStatus('2fa');
			//return;
			// } else {
			// 	localStorage.setItem('token', data);
			// }
		} catch (err: any) {
			console.log(err.message)
		}
		//localStorage.removeItem('_2fa');
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
	//const { auth, setAuth } = useContext(AuthContext);
	const [status, setStatus] = useState<'connect' | 'error' | 'loading'>('loading');

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