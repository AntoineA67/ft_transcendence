import { useEffect } from 'react';

export function Oauth42() {
	const random = Math.random().toString(36).slice(2, 12);

	const api42 = 'https://api.intra.42.fr/oauth/authorize';
	const clientId = 'u-s4t2ud-92e9863469ae5ee4e62ea09c6434ee83527230b782782a942f3145cc1ed79b89';
	const redirectUri = process.env.REACT_APP_FRONTEND_URL + '/42/callback';
	const responseType = 'code';
	const scope = 'public';

	const oauth42 = `${api42}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${random}`;

	useEffect(() => {
		localStorage.setItem('random', random);
	}, []);

	return oauth42;
}