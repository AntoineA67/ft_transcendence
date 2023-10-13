//react router
import ReactDOM from 'react-dom/client';
import React from 'react';
import { createBrowserRouter, Routes, Route, createRoutesFromElements } from 'react-router-dom';
import { LoaderFunctionArgs, RouterProvider } from 'react-router-dom';
// import router from './router';

//import component
import TestDB from './pages/TestDB';
import { Login, Signin, Signup, LandingPage, TokenPage } from './pages/Login';
import Sidebar from './pages/Sidebar'
import { Home } from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import { Setting, TwoFactorAuth, SettingMenu } from './pages/ProfileSetting';
import { Search } from './pages/Search';
import { Friends } from './pages/Friends';
import { Chat, ChatBox } from './pages/Chat';
import { UserProfile } from './utils/UserProfile';
import { socket } from './utils/socket';

//css
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customButton.css';
import './styles/customForm.css';
import './styles/index.css';

import { CallBack42, Protected } from './utils/AuthProvider';
import { Guest } from './utils/Guest';
import axios from 'axios';
import reportWebVitals from './reportWebVitals';
import { GameSocketProvider } from './utils/GameSocketProvider';
import { profileType } from '../types/user';

axios.defaults.baseURL = 'http://127.0.0.1:3000';
axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

async function loadProfile({ params }: LoaderFunctionArgs) {
	// need to be done with fetch
	
	// let profile = null;
	// await socket.emit('Profile', params.userNick, (response: profileType) => {
	// 	console.log('userNick: ', params.userNick)
	// 	profile = response;
	// 	console.log('res: ', response)
	// })
	// console.log('profile: ', profile)
	// if (!profile) {
	// 	console.log('loader throw');
	// 	throw new Error('User not found');
	// }
	// return (profile);

}

// const root = ReactDOM.createRoot(
// 	document.getElementById('root') as HTMLElement
// );

const router = createBrowserRouter(
	createRoutesFromElements(
		<>	
			<Route element={<Guest />}>
				<Route path="/login" element={<Login />}>
					<Route index element={<LandingPage />}></Route>
					<Route path="signin" element={<Signin />}></Route>
					<Route path="signup" element={<Signup />}></Route>
					<Route path="2fa" element={<TokenPage />}></Route>
				</Route>
			</Route>

			<Route path='/42/callback' element={<CallBack42 />} />

			<Route element={<Protected />}>
				<Route path="/" element={<Sidebar />}>
					<Route index element={<Profile />} />

					<Route path="search" element={<Search />}>
						<Route 
							path=':userNick' 
							element={<UserProfile />}
							loader={loadProfile}
							/>
					</Route>
					
					<Route path="friends" element={<Friends />}>
						<Route 
							path=':userNick' 
							element={<UserProfile />} 
							loader={loadProfile}
						/>
					</Route>
					
					<Route path="chat" element={<Chat />}>
						<Route path=':chatId' element={<ChatBox />}></Route>
					</Route>
					
					{/* <Route path="setting" element={<Setting />}>
						<Route index element={<SettingMenu />}></Route>
					</Route> */}
					<Route path="setting" element={<Setting />}>
						<Route index element={<SettingMenu />}></Route>
						<Route path='2fa' element={<TwoFactorAuth />}></Route>
					</Route>
					
					<Route path="game" element={<>
						<GameSocketProvider>
							<Game />
						</GameSocketProvider>
					</>}></Route>
				</Route>
			</Route>

				{/* <Route path="/game" element={<>
					<GameSocketProvider>
						<GameSocketProvider />
					</GameSocketProvider>
				</>}></Route> */}
			<Route path="/test-db" element={<TestDB />} />	
		</>
	)
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();