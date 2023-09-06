//react router
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import router from './router';

//import component
import TestDB from './pages/TestDB';
import { Login, Signin, Signup, LandingPage } from './pages/Login';
import Sidebar from './pages/Sidebar'
import { Home } from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import { Setting, ChangePassword, SettingMenu } from './pages/ProfileSetting';
import { Search } from './pages/Search';
import { Friends } from './pages/Friends';
import { Chat, ChatBox } from './pages/Chat';

//css
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customButton.css';
import './styles/customForm.css';
import './styles/index.css';

import { AuthProvider, CallBack42, Protected } from './utils/AuthProvider';

import axios from 'axios';
import reportWebVitals from './reportWebVitals';
import { SocketProvider } from './utils/socket';

axios.defaults.baseURL = 'http://127.0.0.1:3000';
axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<BrowserRouter>
		<AuthProvider>
			<Routes>
				<Route path="/login" element={<Login />}>
					<Route index element={<LandingPage />}></Route>
					<Route path="signin" element={<Signin />}></Route>
					<Route path="signup" element={<Signup />}></Route>
				</Route>

				<Route path='/42/callback' element={<CallBack42 />} />

				<Route element={<Protected />}>
					<Route path="/" element={<Sidebar />}>
						<Route index element={<Profile />} />
						<Route path="search" element={<Search />}></Route>
						<Route path="friends" element={<Friends />}></Route>
						<Route path="chat" element={<Chat />}>
							<Route path=':chatId' element={<ChatBox />}></Route>
						</Route>
						<Route path="setting" element={<Setting />}>
							<Route index element={<SettingMenu />}></Route>
							<Route path='changepassword' element={<ChangePassword />}></Route>
						</Route>
						<Route path="/game" element={<>
							<SocketProvider>
								<Game />
							</SocketProvider>
						</>}></Route>
					</Route>
					<Route path="/test-db" element={<TestDB />} />
				</Route>
			</Routes>
		</AuthProvider>
	</BrowserRouter>

	//   <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
