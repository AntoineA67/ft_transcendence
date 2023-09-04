import { createContext, ReactComponentElement, useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

type auth = {
	id: string,
	nickname: string,
	avatar: string,
	token: string,
	refreshToken: string,
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

export function Protected({children}: any) {
	const { auth } = useContext(AuthContext);
	return (
		auth ? (
			<Outlet />
		) : (
			<Navigate to="/login" replace={true}/>
		)
	);
}