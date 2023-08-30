import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { socket } from '../utils/socket';
import { useEffect, useRef, useState } from 'react';
import { proxy } from 'valtio';
import { Socket } from 'socket.io-client';
import { ListGroup } from 'react-bootstrap';

const state = proxy({
	socketClient: null as Socket | null,
})

interface Props {
	socket: Socket;
}

function ChatView(props: Props) {
	const [messages, setMessages] = useState<any[]>([]);

	useEffect(() => {
		// Update the messages state whenever new messages are received
		props.socket.on('receiveMessage', (newMessages: any) => {
			console.log('RECEIVE MESSAGE', newMessages)
			setMessages(newMessages);
		});
	}, [props.socket]);

	return (
		<>
			<ListGroup>
				{messages.map((message) =>
					<ListGroup.Item key={message.id}>{message.message}</ListGroup.Item>)}
			</ListGroup>
		</>
	);
}

const users = [
	{ id: 1, username: 'user1', avatar: 'url_de_l_avatar' },
	{ id: 2, username: 'user2', avatar: 'url_de_l_avatar' },
];



export function Chat() {
	const message = useRef('');
	useEffect(() => {
		state.socketClient = socket
		return () => {
			if (state.socketClient) state.socketClient.disconnect()
		}
	}, [])

	const handleKeyDown = (event: any) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			socket.emit('sendMessage', message.current);
			message.current = '';
		}
	};

	useEffect(() => {
		if (state.socketClient) {
			socket.on('connect', function () {
				console.log('connected to messages')
			})
			socket.on('disconnect', function (message: any) {
				console.log('disconnect ' + message)
			})
		}
	}, [state.socketClient])
	return (
		<>
			<Container>
				<Form.Control type="text" placeholder="Chat anything"
					onChange={msg => message.current = msg.target.value}
					onKeyDown={handleKeyDown} />
				<ChatView socket={socket} />
				<Row>
					<Col md={4}>
						<ListGroup>
							{users.map((user) => (
								<ListGroup.Item key={user.id} className="d-flex align-items-center">
									<Image src={user.avatar} roundedCircle className="mr-2" width={40} height={40} />
									{user.username}
								</ListGroup.Item>
							))}
						</ListGroup>
					</Col>
					<Col md={8}>
						{/* Contenu de la page principale */}
					</Col>
				</Row>
			</Container>
		</>
	)
}