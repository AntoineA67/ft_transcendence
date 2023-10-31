import { io } from "socket.io-client";

const URL: string = process.env.REACT_APP_BACKEND_URL?.toString() || '';


export const socket = io(URL, {
	autoConnect: false,
	transports: ['websocket'],
});

export const friendsSocket = io(`${URL}/friends`, {
	autoConnect: false,
	transports: ['websocket'],
})

export const chatsSocket = io(`${URL}/chats`, {
	autoConnect: false,
	transports: ['websocket'],
})

export const gamesSocket = io(`${URL}/game`, {
	autoConnect: false,
	transports: ['websocket'],
})