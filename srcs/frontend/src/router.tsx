import Home from './pages/Home';
import Game from './pages/Game';
import { createBrowserRouter } from "react-router-dom";
import TestDB from './pages/TestDB';
import Profile from './pages/Profile';
import Login from './pages/Login';

const router = createBrowserRouter([
	{
		path: "/test-db",
		loader: () => ({ message: "Hello Data Router!" }),
		Component() {
			return TestDB();
		},
	},
	{
		path: "/",
		loader: () => ({ message: "Hello Data Router!" }),
		Component() {
			return Home();
		},
	},
	{
		path: "/profile",
		loader: () => ({ message: "Hello Data Router!" }),
		Component() {
			return Profile();
		},
	},
	{
		path: "/login",
		loader: () => ({ message: "Hello Data Router!" }),
		Component() {
			return Login();
		},
	},
	{
		path: "/game",
		loader: () => ({ message: "Hello Data Router!" }),
		Component() {
			return Game();
		},
	},
]);

export default router;
