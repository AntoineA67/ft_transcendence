import { io } from "socket.io-client";

const URL = 'http://localhost:3000';

export const socket = io(URL, {
	autoConnect: false,
	transports: ['websocket'],
});

export const chatsSocket = io(`${URL}/chats`, {
	autoConnect: false,
	transports: ['websocket'],
})