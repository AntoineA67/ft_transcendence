//react router
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, RouterProvider } from 'react-router-dom';
// import router from './router';

//import component
import TestDB from './pages/TestDB';
import { Login, Signin, Signup, LandingPage } from './pages/Login'; 
import Sidebar from './pages/Sidebar'
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';


//css
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customButton.css';
import './styles/customForm.css';
import './styles/index.css';

import axios from 'axios';
import reportWebVitals from './reportWebVitals';


axios.defaults.baseURL = 'http://127.0.0.1:3000';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Sidebar />}>
				<Route index element={<Profile />} />
			</Route>
			
			<Route path="/login" element={<Login />}>
				<Route index element={<LandingPage />}></Route>
				<Route path="signin" element={<Signin />}></Route>
				<Route path="signup" element={<Signup />}></Route>
			</Route>
			
			<Route path="/game" element={<Game />}></Route>
			
			<Route path="/test-db" element={<TestDB />} />

		</Routes>
	</BrowserRouter>
//   <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
