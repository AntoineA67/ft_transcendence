import '../styles/ProfileSetting.css';
import '../styles/Chat.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Title} from './ProfileSetting';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";

import Form from 'react-bootstrap/Form';
import { socket } from '../utils/socket';
import { useEffect, useRef, useState } from 'react';
import { proxy } from 'valtio';
import { Socket } from 'socket.io-client';
import { ListGroup } from 'react-bootstrap';
import { io } from "socket.io-client";

type message = {
	id: string,
	date: Date,
	from: string,
	to: string, 
	content: string,
}


//get chat content according to id
export function ChatBox() {
	const { chatId } = useParams();
	const [mess, setMess] = useState('');

	//get old message; nickname
	const messages: message[] = [
		{id: '1', date: new Date(), from: 'pigeon', to: 'me', content: 'coucou'}, 
		{id: '2', date: new Date(), from: 'pigeon', to: 'me', content: 'Got any peanuts?'}, 
		{id: '3', date: new Date(), from: 'me', to: 'pigeon', content: 'Hi'}, 
		{id: '4', date: new Date(), from: 'me', to: 'pigeon', content: 'I got something better' } 
	];

	const myMap = (message: message) => {
		const classname = (message.to == 'me') ? 'messageBlue' : 'messagePink';

		return (
			<li key={message.id} className={classname} >
				{message.content}
			</li>
		);
	}

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		//send message to server
		setMess('');
	}

	return (
		<div className='h-100 d-flex flex-column'>
			<div className='d-flex w-100 align-items-center p-2 ps-5' style={{ backgroundColor: "black" }}>
				<h4 style={{ color: "white", margin: "auto 0" }}>{chatId}</h4>
			</div>
			
			<div className='p-5' style={{overflowY: 'auto', height: '85%', border: '1px solid green'}}>
				<ul className='nostyleList' style={{color: 'white'}}>
					{messages.map(myMap)}
					{messages.map(myMap)}
					{messages.map(myMap)}
					{messages.map(myMap)}
				</ul>
			</div>
			
			<div className='mt-auto pb-5 pb-sm-0'>
				<input value={mess} onChange={(e) => setMess(e.target.value)} />
				<button onClick={handleClick}></button>
			</div>
		</div>
	);
}

function ChatList() {
	//get all chat
	const chatList = ['fox', 'crow', 'crowGroup'];

	const myMap = (name: string) => {
		return (
			<li key={name} className='chatListItem'>
				<Link to={name} className='link-text'>
					{name}
				</Link>
			</li>
		)
	}

	const newChat = () => {
		//new chat
	}

	return (
		<>
			<div className='d-flex w-100 align-items-center p-2' style={{ backgroundColor: "black" }}>
				<h4 style={{ color: "white", margin: "auto 0" }}>Chat</h4>
				<button className='new-chat ms-auto' onClick={newChat}/>
			</div>

			<ul className='nostyleList'>
				{chatList.map(myMap)}
			</ul>
		</>
	
	);
}


export function Chat() {
	
	
	
	return (
		<div className='container-fluid h-100'>
			<div className='row h-100' >
				<div className='col-3 p-0' >
					<ChatList></ChatList>
				</div>
				<div className='col-9 p-0'>
					<Outlet></Outlet>
				</div>
			</div>
		</div>
	);
}

















// const state = proxy({
// 	socketClient: null as Socket | null,
// })

// interface Props {
// 	socket: Socket;
// }

// function ChatView(props: Props) {
// 	const [messages, setMessages] = useState<any[]>([]);

// 	useEffect(() => {
// 		// Update the messages state whenever new messages are received
// 		props.socket.on('receiveMessage', (newMessages: any) => {
// 			console.log('RECEIVE MESSAGE', newMessages)
// 			setMessages(newMessages);
// 		});
// 	}, [props.socket]);

// 	return (
// 		<>
// 			<ListGroup>
// 				{messages.map((message) =>
// 					<ListGroup.Item key={message.id}>{message.message}</ListGroup.Item>)}
// 			</ListGroup>
// 		</>
// 	);
// }

// export function Chat() {
// 	const message = useRef('');
// 	useEffect(() => {
// 		state.socketClient = socket
// 		return () => {
// 			if (state.socketClient) state.socketClient.disconnect()
// 		}
// 	}, [])

// 	const handleKeyDown = (event: any) => {
// 		if (event.key === 'Enter') {
// 			event.preventDefault();
// 			socket.emit('sendMessage', message.current);
// 			message.current = '';
// 		}
// 	};

// 	useEffect(() => {
// 		if (state.socketClient) {
// 			socket.on('connect', function () {
// 				console.log('connected to messages')
// 			})
// 			socket.on('disconnect', function (message: any) {
// 				console.log('disconnect ' + message)
// 			})
// 		}
// 	}, [state.socketClient])
// 	return (
// 		<>
// 			<Form.Control type="text" placeholder="Chat anything"
// 				onChange={msg => message.current = msg.target.value}
// 				onKeyDown={handleKeyDown} />
// 			<ChatView socket={socket} />
// 			<Outlet />
// 		</>
// 	)
// }