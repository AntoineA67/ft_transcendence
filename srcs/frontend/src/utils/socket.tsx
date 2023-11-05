import { io } from "socket.io-client";

const URL: string = process.env.REACT_APP_BACKEND_URL?.toString() || '';

const socketOptions = {
  autoConnect: false,
  query: {
    transports: "websocket",
  },
};

export const socket = io(URL, socketOptions);

export const friendsSocket = io(`${URL}/friends`, socketOptions);

export const chatsSocket = io(`${URL}/chats`, socketOptions);

export const gamesSocket = io(`${URL}/game`, socketOptions);

// before
// import { io } from "socket.io-client";

// const URL: string = process.env.REACT_APP_BACKEND_URL?.toString() || '';


// export const socket = io(URL, {
// 	autoConnect: false,
// 	transports: ['websocket'],
// });

// export const friendsSocket = io(`${URL}/friends`, {
// 	autoConnect: false,
// 	transports: ['websocket'],
// })

// export const chatsSocket = io(`${URL}/chats`, {
// 	autoConnect: false,
// 	transports: ['websocket'],
// })

// export const gamesSocket = io(`${URL}/game`, {
// 	autoConnect: false,
// 	transports: ['websocket'],
// })