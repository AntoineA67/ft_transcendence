import { io } from "socket.io-client";

const URL: string = process.env.REACT_APP_FRONTEND_URL?.toString() || '';

const socketOptions = {
	autoConnect: false,
	transports: ['websocket'],
};

export const socket = io(URL, socketOptions);
export const friendsSocket = io(`${URL}/friends`, socketOptions);
export const chatsSocket = io(`${URL}/chats`, socketOptions);
export const gamesSocket = io(`${URL}/game`, socketOptions);
