import logo from './logo.svg';
// import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../socket';

interface Message {
	id: number;
	content: string;
	createdAt: string;
}

function Home() {

	const [messages, setMessages] = useState<Message[]>([]);
	const [msg, setMsg] = useState('');

	useEffect(() => {
		axios.get('/messages')
			.then(response => {
				setMessages(response.data);
			})
			.catch(error => {
				console.error(error);
			});
	}, []);

	socket.on('connect', () => {
		console.log('connected');
	});

	socket.on('update', (message: Message) => {
		setMessages([...messages, message]);
	});
	socket.on('clients', (message: Message) => {
		console.log(message);
	});

	const sendMsg = () => {

		socket.emit('sendMessage', msg);
		console.log('sent');
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
				<input
					name="send"
					type="text"
					onChange={(e) => setMsg(e.target.value)}
				/>
				<button onClick={() => sendMsg()}>Envoyer</button>
				<ul>
					{messages.map(message => (
						<li key={message.id}>{message.content}</li>
					))}
				</ul>
			</header>
		</div>
	);
}

export default Home;