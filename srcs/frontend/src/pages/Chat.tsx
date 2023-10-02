import '../styles/ProfileSetting.css';
import '../styles/Chat.css';
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { socket } from '../utils/socket';
import { useNavigate } from 'react-router-dom';

type Message = {
	id: number,
	message: string,
	send_date: Date,
	userId: number,
	roomId: number,
	username: string,
};

type Profile = {
	avatar: string | null;
	bio: string;
	id: number;
	status: string;
	username: string;
};

type Rooms = {
	id: number,
	isChannel: boolean,
	title: string,
	private: boolean,
	password: string,
}

type Memberstatus = {
	owner: boolean,
	admin: boolean,
	banned: boolean,
};

export function ChatBox() {
	const { chatId } = useParams();
	const [mess, setMess] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [roomTitle, setroomTitle] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [profile, setProfile] = useState<Profile>({
		avatar: null,
		bio: '',
		id: 0,
		status: '',
		username: '',
	});
	const [memberstatus, setMemberstatus] = useState<Memberstatus>({
		owner: false,
		admin: false,
		banned: false,
	});
	const navigate = useNavigate();
	const messagesEndRef = useRef<HTMLUListElement | null>(null);

	useEffect(() => {
		socket.connect();
		socket.emit('getRoomData', chatId, (data: { messages: Message[], roomTitle: string }) => {
			setroomTitle(data.roomTitle);
			setMessages(data.messages);
			setLoading(false);
		});

		socket.emit('MyProfile', (data: Profile) => {
			setProfile(data);
		});

		socket.emit('getMemberDatabyRoomId', chatId, (data: Memberstatus) => {
			setMemberstatus(data);
		});

		socket.on('messageSent', (newMessage: Message) => {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		});
		return () => {
			socket.disconnect();
			socket.off('messageSent');
		};
	}, [chatId]);

	useEffect(() => {
		if (!loading && roomTitle === '') {
			navigate('/chat');
		}
	}, [loading, roomTitle, navigate]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (mess.trim()) {
				handleSendMessage();
			}
		}
	};

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ block: "end", inline: "nearest" });
		}
	}, [messages]);

	const handleClick = () => {
		if (mess.trim()) {
			handleSendMessage();
		}
	};

	const handleSendMessage = () => {
		socket.emit('sendMessage', {
			roomId: chatId,
			content: mess,
			userid: profile.id,
		}, (response: any) => {
			if (response.error) {
				console.error('Erreur lors de l\'envoi du message :', response.error);
			}
		});
		setMess('');
	};

	const myMap = (message: Message, profile: Profile, member: Memberstatus) => {
		const classname = message.userId === profile.id ? 'messageBlue' : 'messagePink';
		const classuser = message.userId === profile.id ? 'userBlue' : 'userPink';
		const formattedTime = new Date(message.send_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		const role = member.owner ? 'Owner' : member.admin ? 'Admin' : member.banned ? 'Banned' : 'Member';

		if (message.userId === profile.id) {
			message.username = profile.username;
		}

		return (
			<div className="message-container" key={message.id}>
				<strong className={`message ${classuser}`}>{message.username} - {role} - {formattedTime}</strong>
				<div className={`message ${classname}`}>
					{message.message}
				</div>
			</div>
		);
	};

	return (
		<div className="h-100 d-flex flex-column">
			<div className="d-flex w-100 align-items-center p-1 ps-sm-5" style={{ backgroundColor: '' }}>
				<Link to="..">
					<button className="goBack"></button>
				</Link>
				<h4 style={{ color: 'white', margin: 'auto 0' }}>{roomTitle}</h4>
			</div>
			<div className="p-5 flex-grow" style={{ overflowY: 'auto' }}>
				<ul
					ref={messagesEndRef}
					className="nostyleList d-flex flex-column"
					style={{ color: 'white', minHeight: 'calc(100vh - 100px)' }}
				>
					{messages.map((message) => myMap(message, profile, memberstatus))}
				</ul>
			</div>
			<div className="mb-5 mb-sm-0 p-3  d-flex align-items-center">
				<input
					className={`p-2 flex-grow-1 ${memberstatus.banned ? 'banned-text' : ''}`}
					style={{ borderRadius: '10px', textDecoration: memberstatus.banned ? 'line-through' : 'none' }}
					value={mess}
					onChange={(e) => setMess(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={memberstatus.banned}
					placeholder={memberstatus.banned ? 'You\'re banned...' : 'Write a message...'}
				/>
				<button
					className="send-message"
					onClick={() => {
						if (!memberstatus.banned) {
							handleClick();
						}
					}}
					disabled={memberstatus.banned}
				>
				</button>
			</div>
		</div>
	);
}

function MyForm({
	label,
	button,
	value,
	setValue,
	onSubmit,
}: {
	label: string;
	button: "Send" | "Join" | "Create" | "Cancel" | "Submit";
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	onSubmit: () => void;
}) {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit();
	};
	return (
		<form className='d-flex flex-column align-items-center p-2 gap-2' onSubmit={handleSubmit}>
			<label className='w-75' htmlFor='private-message'>
				{label}
			</label>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className='w-75'
			/>
			<button type='submit' className='btn btn-outline-secondary w-75'>
				{button}
			</button>
		</form>
	);
}

function JoinGroupHandler({ roomTitle, roomid, password }: { roomTitle: string; roomid: string; password: string }) {
	const [joinbool, setJoinbool] = useState<boolean>();
	const navigate = useNavigate();

	useEffect(() => {
		const roomdata = {
			roomTitle: roomTitle,
			roomid: roomid,
			password: password,
		};
		socket.emit('joinRoom', roomdata, (response: boolean) => {
			if (response === false) {
				console.error('Erreur lors de la connexion au groupe : ', roomTitle);
			} else {
				setJoinbool(true);
			}
		});
		return () => {
			socket.disconnect();
		};
	}, [roomTitle, roomid, password]);

	useEffect(() => {
		if (joinbool === undefined)
			return;
		if (joinbool === true) {
			navigate(`/chat/${roomid}`);
		} else {
			alert('Wrong Name or Room ID or Password or you\'re already in the room');
			navigate('/chat');
		}
	}, [joinbool, navigate, roomid]);
	return null;
}

function NewChat({ setPage }: { setPage: React.Dispatch<React.SetStateAction<"chatList" | "newChat">> }) {
	const [nick, setNick] = useState('');
	const [join, setJoin] = useState('');
	const [create, setCreate] = useState('');
	const [roomId, setRoomId] = useState('');
	const [password, setPassword] = useState('');
	const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
	const [isJoinHandlerVisible, setJoinHandlerVisible] = useState(false);

	const JoinGroup = (roomTitle: string) => {
		if (roomTitle.trim() !== '') {
			setJoinDialogOpen(true);
		}
	};

	const handleSecondJoinClick = () => {
		if (roomId.trim() === '' || join.trim() === '') {
			alert('Please enter both Room ID and Room title. (the password is optional)');
			return;
		}
		setJoinHandlerVisible(true);
		setJoinDialogOpen(false);
	};

	const handleCreateGroup = (roomTitle: string) => {
		if (roomTitle.trim() !== '') {
			socket.emit('createChannelRoom', roomTitle);
			socket.on('roomCreated', (response: Rooms) => {
				if (response)
					setPage('chatList');
				else
					console.error(`Erreur lors de la création du groupe : `, roomTitle);
				return ;
			});
		}
	}

	const handlePrivateMessage = (username: string) => {
		if (username.trim() !== '') {
			socket.emit('createPrivateRoom', username);
			socket.on('roomCreated', (response: Rooms) => {
				if (response)
					setPage('chatList');
				else
					console.error(`Erreur lors de la création du groupe : `, username); // TODO: why this is called exponential time ?
				return ;
			});
		}
	}

	return (
		<div className='w-100 h-100 d-flex flex-column p-1 pb-5 pb-sm-0 m-0' style={{ color: 'white', overflowY: 'auto' }}>
			<button className='cross ms-auto' onClick={() => setPage('chatList')} />
			<MyForm label='Private message to:' button='Send' value={nick} setValue={setNick} onSubmit={() => handlePrivateMessage(nick)} />
			{!isJoinDialogOpen && (
				<MyForm label='Join a group:' button='Join' value={join} setValue={setJoin} onSubmit={() => JoinGroup(join)} />
			)}
			<MyForm label='Create a group:' button='Create' value={create} setValue={setCreate} onSubmit={() => handleCreateGroup(create)} />

			{isJoinDialogOpen && (
				<div className='join-dialog'>
					<div className='d-flex justify-content-between'>
						<h5>Join {join}</h5>
						<button className='cross' onClick={() => setJoinDialogOpen(false)} />
					</div>
					<div className='form-group'>
						<label htmlFor='roomID'>Room ID:</label>
						<input
							type='text'
							id='roomID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							className='form-control'
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='password'>Password:</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='form-control'
						/>
					</div>
					<div className='d-flex justify-content-between'>
						<button type='submit' className='btn btn-outline-secondary w-45' onClick={handleSecondJoinClick}>
							Join
						</button>
						<button type='submit' className='btn btn-outline-secondary w-45' onClick={() => setJoinDialogOpen(false)}>
							Cancel
						</button>
					</div>
				</div>
			)}
			{isJoinHandlerVisible && (<JoinGroupHandler roomTitle={join} roomid={roomId} password={password} />)}
		</div>
	);
}

export function ChatList() {
	const [page, setPage] = useState<'chatList' | 'newChat'>('chatList');
	const [rooms, setRooms] = useState<Rooms[]>([]);

	useEffect(() => {
		socket.connect();
		socket.emit('getAllRoomsByUserid', (response: Rooms[]) => {
			setRooms(response);
		});
		socket.on('roomCreated', (response: Rooms) => {
			if (response)
				setRooms((prevRooms) => [response, ...prevRooms]);
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	const myMap = (room: Rooms) => {
		console.log(room);
		const channelclass = room.isChannel === true ? 'chatListItemChannel' : 'chatListItemPrivate';

		return (
			<li key={room.title}>
				<Link to={`/chat/${room.id}`} className='link-text' style={{ color: 'white' }}>
					<div className={`chatListItemButton ${channelclass}`}>{room.title}</div>
				</Link>
			</li>
		);
	};

	return (
		<div className='w-100 h-100 d-flex flex-column'>
			{page === 'newChat' && <NewChat setPage={setPage} />}
			{page === 'chatList' && (
				<>
					<div className='d-flex w-100 align-items-center p-2 ps-4 ps-sm-5' style={{ backgroundColor: "" }}>
						<h4 style={{ color: "white", margin: "auto 0" }}>Chat</h4>
						<button className='new-chat ms-auto' onClick={() => setPage('newChat')} />
					</div>
					<div className='ps-sm-2' style={{ overflowY: 'auto' }}>
						<ul className='nostyleList py-1' >
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
	const classname1 = location.pathname === '/chat' ? '' : 'd-none d-sm-flex';
	const classname2 = location.pathname === '/chat' ? 'd-none d-sm-flex' : '';

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
