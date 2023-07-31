import './App.css';
import axios from 'axios';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './Home';
import Game from './Game';
import Menu from './Menu';
// import Intro from './ping-pong/Intro';
// import PingPong from './ping-pong/PingPong';

axios.defaults.baseURL = 'http://127.0.0.1:3000';

let router = createBrowserRouter([
  {
    path: "/home",
    loader: () => ({ message: "Hello Data Router!" }),
    Component() {
      return Home();
    },
  },
  {
    path: "/",
    loader: () => ({ message: "Hello Data Router!" }),
    Component() {
      return Menu();
    },
  },
  // {
  //   path: "/game",
  //   loader: () => ({ message: "Hello Data Router!" }),
  //   Component() {
  //     return <><Intro>
  //       <PingPong ready={true} />
  //     </Intro></>;
  //   },
  // },
]);

export default function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}
