import '../styles/ProfileSetting.css';
import '../styles/Chat.css';
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { socket } from '../utils/socket';
import io from 'socket.io-client';

type Message = {
	id: number,
	message: string,
	send_date: Date,
	userId: number,
	roomId: number,
};

export function ChatBox() {
	console.log('inside a chatbox');
	const { chatId } = useParams();
	const [mess, setMess] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		socket.connect();
		socket.emit('getMessagesByRoomId', chatId, (message: Message[]) => {
		setMessages(message);
		});
		return () => {
		socket.disconnect();
		};
	}, [chatId]);

	console.log('messages', messages);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
	e.preventDefault();
	socket.emit('sendMessage', {
		to: chatId,
		content: mess,
	});
	setMess('');
	};

	const myMap = (message: Message, userId: number) => {
		const classname = message.userId === userId ? 'messageBlue' : 'messagePink';
		return (
		  <li key={message.id} className={classname}>
			{message.message}
		  </li>
		);
	  };

	return (
	<div className="h-100 d-flex flex-column">
		<div
		className="d-flex w-100 align-items-center p-1 ps-sm-5"
		style={{ backgroundColor: 'black' }}
		>
		<span className="d-sm-none">
			<Link to="..">
			<button className="goBack"></button>
			</Link>
		</span>
		<h4 style={{ color: 'white', margin: 'auto 0' }}>{chatId}</h4>
		</div>

		<div className="p-5 flex-grow" style={{ overflowY: 'auto' }}>
		<ul className="nostyleList d-flex flex-column" style={{ color: 'white' }}>
			{messages.map(myMap)}
		</ul>
		</div>

		<div className="mb-5 mb-sm-0 p-3  d-flex align-items-center">
		<input
			className="p-2 flex-grow-1"
			style={{ borderRadius: '10px' }}
			value={mess}
			onChange={(e) => setMess(e.target.value)}
		/>
		<button className="send-message" onClick={handleClick}></button>
		</div>
	</div>
	);
}

type formProp = {
	label: string,
	button: 'Send' | 'Join' | 'Create',
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
}
const users = [
	{ id: 1, username: 'user1', avatar: 'url_de_l_avatar' },
	{ id: 2, username: 'user2', avatar: 'url_de_l_avatar' },
];

const MyForm = ({ label, button, value, setValue }: formProp) => {
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>,
		type: 'Send' | 'Join' | 'Create', value: string, setValue: React.Dispatch<React.SetStateAction<string>>) {
		e.preventDefault();
		setValue('');
	}

	return (
		<form className='d-flex flex-column align-items-center p-2 gap-2'
			onSubmit={(e) => handleSubmit(e, button, value, setValue)}>
			<label
				className='w-75'
				htmlFor='private-message'>
				{label}
			</label>
			<input
				id='private-message'
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className='w-75' />
			<button type='submit' className='btn btn-outline-secondary w-75'>
				{button}
			</button>
		</form>
	);
}

function NewChat({ setPage }: { setPage: React.Dispatch<React.SetStateAction<"chatList" | "newChat">> }) {

	const [nick, setNick] = useState('');
	const [join, setJoin] = useState('');
	const [create, setCreate] = useState('');

	return (
		<div className='w-100 h-100 d-flex flex-column p-1 pb-5 pb-sm-0 m-0' style={{ color: 'white', overflowY: 'auto' }}>
			<button className='cross ms-auto' onClick={() => setPage('chatList')} />
			<MyForm label='Private message to:' button='Send' value={nick} setValue={setNick} />
			<MyForm label='Join a group:' button='Join' value={join} setValue={setJoin} />
			<MyForm label='Create a group' button='Create' value={create} setValue={setCreate} />
		</div>
	)
}

type Rooms = {
	id: number,
	isChannel: boolean,
	title: string,
	private: boolean,
	password: string,
}

export function ChatList() {
	const [page, setPage] = useState<'chatList' | 'newChat'>('chatList');
	const [rooms, setRooms] = useState<Rooms[]>([]);

	useEffect(() => {
	socket.connect();
	socket.emit('getAllRoomsByUserid', (response: Rooms[]) => {
		setRooms(response);
	});
	return () => {
		socket.disconnect();
	};
	}, []);

	const myMap = (room: Rooms) => {
		return (
		  <li key={room.title}>
			<Link to={`/chat/${room.id}`} className='link-text' style={{ color: 'white' }}>
			  <div className='chatListItem'>{room.title}</div>
			</Link>
		  </li>
		);
	  };

	return (
	<div className='w-100 h-100 d-flex flex-column'>
		{page === 'newChat' && <NewChat setPage={setPage} />}
		{page === 'chatList' && (
		<>
			<div className='d-flex w-100 align-items-center p-2 ps-4 ps-sm-2' style={{ backgroundColor: "black" }}>
			<h4 style={{ color: "white", margin: "auto 0" }}>Chat</h4>
			<button className='new-chat ms-auto' onClick={() => setPage('newChat')} />
			</div>

			<div className='flex-grow-1 pb-5 pb-sm-0' style={{ overflowY: 'auto' }}>
			<ul className='nostyleList py-0' >
				{rooms.map(myMap)}
			</ul>
			</div>
		</>
		)}
	</div>
	);
}

export function Chat() {
	const location = useLocation();
	console.log('location', location);
	const classname1 = location.pathname == '/chat' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname == '/chat' ? 'd-none d-sm-flex' : '';

	return (
		<div className='container-fluid h-100' >
			<div className='row h-100' >
				<div className={`col-12 col-sm-3 p-0 m-0 h-100 ${classname1}`} >
					<ChatList />
				</div>
				<div className={`col-12 col-sm-9 p-0 m-0 h-100 ${classname2}`}>
					<Outlet />
				</div>
			</div>
		</div>
	);
}
