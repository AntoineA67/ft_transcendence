//react router
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

//bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customButton.css';
// css
import './styles/index.css';
import './styles/iconButton.css';
import './styles/Chat.css';


import { CallBack42, Protected } from './utils/AuthProvider';
import { Guest } from './utils/Guest';

import axios from 'axios';
import reportWebVitals from './reportWebVitals';
import { GameSocketProvider } from './utils/GameSocketProvider';

axios.defaults.baseURL = 'http://127.0.0.1:3000';
axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<BrowserRouter>
		<Routes>
			<Route element={<Guest />}>
				<Route path="login" element={<Login />}>
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
							<Route path=':userNick' element={<UserProfile />}></Route>
						</Route>
						
						<Route path="friends" element={<Friends />}>
							<Route path=':userNick' element={<UserProfile />}></Route>
						</Route>
						
						<Route path="chat" element={<Chat />}>
							<Route path=':chatId' element={<ChatBox />}></Route>
						</Route>
						
						<Route path="setting" element={<Setting />}>
							<Route index element={<SettingMenu />}></Route>
						</Route>
						
						<Route path="/game" element={<>
							<GameSocketProvider>
								<Game />
							</GameSocketProvider>
						</>}></Route>
					</Route>
					<Route path="setting" element={<Setting />}>
						<Route index element={<SettingMenu />}></Route>
						<Route path='2fa' element={<TwoFactorAuth />}></Route>
					</Route>
					<Route path="/game" element={<>
						<GameSocketProvider>
							<Game />
						</GameSocketProvider>
					</>}></Route>
				</Route>
			<Route path="/test-db" element={<TestDB />} />			
		</Routes>
	</BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();