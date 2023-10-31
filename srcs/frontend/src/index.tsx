//react router
import ReactDOM from 'react-dom/client';
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	LoaderFunctionArgs,
	Outlet,
	redirect
} from 'react-router-dom';
// import router from './router';
import React from 'react';
//import component
import { Login, LandingPage, TokenPage } from './pages/Login';
import { Signin } from './utils/Signin';
import { Signup } from './utils/Signup';
import Sidebar from './pages/Sidebar'
// import { Home } from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import { Setting, TwoFactorAuth, SettingMenu } from './pages/ProfileSetting';
import { Search } from './pages/Search';
import { Friends } from './pages/Friends';
import { Chat, ChatBox } from './pages/Chat';
import { UserProfile } from './utils/UserProfile';
import { DefaultErrorPage } from './pages/DefaultErrorPage';

//bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customButton.css';
// css
import './styles/index.css';
import './styles/iconButton.css';
import './styles/Chat.css';
import './styles/Stat.css';


import { CallBack42, Protected } from './utils/AuthProvider';
import { Guest } from './utils/Guest';

import axios from 'axios';
import reportWebVitals from './reportWebVitals';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

async function loader(route: string, param?: string, refresh = false) {
	const baseUrl = process.env.REACT_APP_BACKEND_URL + '/';
	const token = localStorage.getItem('token') || null;
	const refreshToken = localStorage.getItem('refreshToken') || null;
	const fetchUrl = param ? (`${baseUrl}${route}/${param}`) : (`${baseUrl}${route}`);

	if (!token && !refreshToken) {
		return redirect("/login");
	}
	const res = await fetch(fetchUrl, {
		headers: { 'Authorization': `Bearer ${token}` }
	})
	if (res.status == 200 || res.status == 201) {
		return (res.json());
	}
	if (refresh) {
		throw new Response(res.statusText, { status: res.status });
	}
	console.log('refresh')
	return fetch(process.env.REACT_APP_BACKEND_URL + `/auth/refreshToken`, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ "refreshToken": refreshToken })
	}).then(async (res): Promise<Response> => {
		if (res.status != 201) {
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			throw new Response(res.statusText, { status: res.status })
		}
		const newTokens = await res.json();
		localStorage.setItem('token', newTokens.token);
		localStorage.setItem('refreshToken', newTokens.refreshToken);
		return loader(route, param, true);
	})


	// try {
	// 	const res = await fetch(fetchUrl, {
	// 		headers: { 'Authorization': `Bearer ${token}` }
	// 	});
	// 	if (res.status == 200 || res.status == 201) {
	// 		return (res.json());
	// 	} else {
	// 		throw new Response(res.statusText, { status: res.status })
	// 	}
	// } catch (err: any) {
	// 	if (refresh) { throw err; }
	// 	return fetch(`${baseUrl}auth/refreshToken`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Accept': 'application/json',
	// 			"Content-Type": "application/json"
	// 		},
	// 		body: JSON.stringify({ "refreshToken": refreshToken })
	// 	}).then(async (res): Promise<Response> => {
	// 		if (res.status != 201) {
	// 			throw new Response(res.statusText, { status: res.status })
	// 		}
	// 		const newTokens = await res.json();
	// 		localStorage.setItem('token', newTokens.token);
	// 		localStorage.setItem('refreshToken', newTokens.refreshToken);
	// 		// console.log('success');
	// 		// console.log('newToken: ', newTokens);
	// 		return loader(route, param, true);
	// 	}).catch((err) => {
	// 		localStorage.removeItem('token');
	// 		localStorage.removeItem('refreshToken');
	// 		throw err;
	// 	})
	// }
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Outlet />} errorElement={<DefaultErrorPage />}>

			<Route element={<Guest />}>
				<Route path="login" element={<Login />}>
					<Route index element={<LandingPage />}></Route>
					<Route path="signin" element={<Signin />}></Route>
					<Route path="signup" element={<Signup />}></Route>
					<Route path="2fa" element={<TokenPage />}></Route>
				</Route>
			</Route>

			<Route path='/42/callback' element={<CallBack42 />} />

			<Route element={<Protected />} loader={() => (loader('auth', 'isTokenValid'))}>
				<Route path="/" element={<Sidebar />}>
					<Route index
						element={<Profile />}
						loader={() => (loader('profile', 'me'))}
					/>

					<Route path="search" element={<Search />} loader={() => (loader('users', 'all'))}>
						<Route
							path=':userNick'
							element={<UserProfile />}
							loader={({ params }) => (loader('profile', params.userNick))}
						/>
					</Route>

					<Route path="friends" element={<Friends />}>
						<Route
							path=':userNick'
							element={<UserProfile />}
							loader={({ params }) => (loader('profile', params.userNick))}
						/>
					</Route>

					<Route path="chat" element={<Chat />}>
						<Route
							path=':chatId'
							element={<ChatBox />}
							loader={({ params }) => (loader('rooms', params.chatId))}
						/>
					</Route>

					{/* <Route path="setting" element={<Setting />}>
						<Route index element={<SettingMenu />}></Route>
					</Route> */}
					<Route path="setting" element={<Setting />}>
						<Route index element={<SettingMenu />}></Route>
						<Route path='2fa' element={<TwoFactorAuth />}></Route>
					</Route>

					<Route path="/game" element={<Game />}></Route>
					<Route path="/game/:userId" element={<Game />}></Route>
				</Route>
			</Route>
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	// with strict mode, fetch fails. I don't know why
	// <React.StrictMode>
	<RouterProvider router={router} />
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
