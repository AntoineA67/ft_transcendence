import { createContext, useState } from 'react';

type auth = {
	id: string,
	nickname: string,
	avatar: string,
	token: string,
	refreshToken: string,
}


const AuthContext = createContext({});

function AuthProvider({children}: any) {
	const [auth, setAuth] = useState({});

	
	return (
		<AuthContext.Provider value={{auth, setAuth}}>
			{children}
		</AuthContext.Provider>
	);
}