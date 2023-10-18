
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { chatsSocket } from '../utils/socket';
import { useNavigate } from 'react-router-dom';
import { Message, ProfileTest, Room, Memberstatus, Pvrooms } from './ChatDto';

export function ChatBox() {
	const { chatId } = useParams();
	const [mess, setMess] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [roomTitle, setroomTitle] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [roomChannel, setRoomChannel] = useState<boolean>(true);
	const [memberstatus, setMemberstatus] = useState<Memberstatus>({
		owner: false,
		admin: false,
		ban: false,
		mute: null,
	});
	const navigate = useNavigate();
	const messagesEndRef = useRef<HTMLUListElement | null>(null);
	const [profile, setProfile] = useState<ProfileTest>();

	useEffect(() => {
		chatsSocket.emit('getRoomData', chatId, (data: { messages: Message[], roomTitle: string, roomChannel: boolean }) => {
			setroomTitle(data.roomTitle);
			setMessages(data.messages);
			setRoomChannel(data.roomChannel);
			setLoading(false);
		});

		chatsSocket.emit('getProfileForUser', (profiletest: ProfileTest) => {
			if (profiletest) {
				setProfile(profiletest);
			}
		});

		chatsSocket.emit('getMemberDatabyRoomId', chatId, (data: Memberstatus) => {
			setMemberstatus(data);
		});
		function fc(newMessage: Message) {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		}
		chatsSocket.on('messageSent', fc);
		return () => {
			chatsSocket.off('messageSent', fc);
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
		if (profile === undefined)
			return;
		chatsSocket.emit('sendMessage', {
			content: mess,
			roomId: chatId,
			userid: profile.id,
			username: profile.username,
		}, (response: boolean) => {
			if (!response) {
				console.error('Erreur lors de l\'envoi du message');
			}
		});
		setMess('');
	};

	const myMap = (message: Message, profile: ProfileTest, member: Memberstatus, roomChannel: boolean) => {
		const classname = message.userId === profile.id ? 'messageBlue' : 'messagePink';
		const classuser = message.userId === profile.id ? 'userBlue' : 'userPink';
		const formattedTime = new Date(message.send_date).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});

		let role = '';

		if (roomChannel) {
			role = member.owner ? 'Owner' : member.admin ? 'Admin' : member.ban ? 'Banned' : 'Member';
			role += ' - ';
		}

		if (message.userId === profile.id) {
			message.username = profile.username;
		}

		return (
			<div className="message-container" key={message.id}>
				<strong className={`${classuser}`}>
					{message.username} - {role}
					{formattedTime}
				</strong>
				<div className={`${classname}`}>{message.message}</div>
			</div>
		);
	};

	return (
		<div className="h-100 d-flex flex-column">
			<div className="d-flex w-100 align-items-center p-1">
				<Link to="..">
					<button className="leftArrow m-2"></button>
				</Link>
				<h4 className='white-text ms-2'>{roomTitle}</h4>
			</div>
			<div className="p-5 flex-grow overflow-y-auto">
				<ul
					ref={messagesEndRef}
					className="d-flex flex-column"
				>
					{profile !== undefined ? messages.map((message) => myMap(message, profile, memberstatus, roomChannel)) : null}
				</ul>
			</div>
			<div className="mt-auto p-3 d-flex align-items-center">
				<input
					className={`flex-grow-1 ${memberstatus.ban ? 'banned-text' : ''}`}
					value={mess}
					onChange={(e) => setMess(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={memberstatus.ban}
					placeholder={memberstatus.ban ? 'You\'re banned/blocked or you\'re blocking the personn...' : 'Write a message...'}
				/>
				<button
					className="send-message"
					onClick={() => {
						if (!memberstatus.ban) {
							handleClick();
						}
					}}
					disabled={memberstatus.ban}
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

function NewChat({ setPage }: { setPage: React.Dispatch<React.SetStateAction<"chatList" | "newChat">> }) {
	const [nick, setNick] = useState('');
	const [join, setJoin] = useState('');
	const [create, setCreate] = useState('');
	const [roomId, setRoomId] = useState('');
	const [password, setPassword] = useState('');
	const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
	const navigate = useNavigate();

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
		setJoinDialogOpen(false);
		handleJoinGroup();
	};

	const handleCreateGroup = (roomTitle: string) => {
		if (roomTitle.trim() === '')
			return;
		chatsSocket.emit('createChannelRoom', roomTitle, (response: number) => {
			if (response > 0) {
				setPage('chatList');
				navigate(`/chat/${response}`);
			}
			else
				alert(`Error while creating room ${roomTitle}`);
		});
	}

	const handlePrivateMessage = (username: string) => {
		if (username.trim() === '')
			return;
		chatsSocket.emit('createPrivateRoom', username, (response: number) => {
			if (response > 0) {
				setPage('chatList');
				navigate(`/chat/${response}`);
			}
			else
				alert(`Error while creating room with ${username}`);
		});
	}

	const handleJoinGroup = () => {
		const roomdata = {
			roomTitle: join,
			roomid: roomId,
			password: password,
		};
		chatsSocket.emit('joinRoom', roomdata, (response: boolean) => {
			if (response === false) {
				alert('Wrong Name or Room ID or Password or you\'re already in the room');
				setJoin('');
				setRoomId('');
				setPassword('');
			} else {
				setPage('chatList');
				navigate(`/chat/${roomId}`);
			}
		});
	}

	return (
		<div className='h-100 d-flex flex-column p-1 pb-5 white-text overflow-y-auto'>
			<div>
				<button className='leftArrow' onClick={() => setPage('chatList')} />
			</div>
			<MyForm label='Private message to:' button='Send' value={nick} setValue={setNick} onSubmit={() => handlePrivateMessage(nick)} />
			{!isJoinDialogOpen && (
				<MyForm label='Join a group:' button='Join' value={join} setValue={setJoin} onSubmit={() => JoinGroup(join)} />
			)}
			<MyForm label='Create a group:' button='Create' value={create} setValue={setCreate} onSubmit={() => handleCreateGroup(create)} />

			{isJoinDialogOpen && (
				<div>
					<div className='d-flex justify-content-between'>
						<h5>Join {join}</h5>
						<button className='leftArrow' onClick={() => setJoinDialogOpen(false)} />
					</div>
					<div className='form-group'>
						<label htmlFor='roomID'>Room ID:</label>
						<input
							type='text'
							id='roomID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='password'>Password:</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div className='d-flex justify-content-between'>
						<button type='submit' className='btn btn-outline-secondary' onClick={handleSecondJoinClick}>
							Join
						</button>
						<button type='submit' className='btn btn-outline-secondary' onClick={() => setJoinDialogOpen(false)}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export function ChatList() {
	const [page, setPage] = useState<'chatList' | 'newChat'>('chatList');
	const [rooms, setRooms] = useState<Room[]>([]);
	const [profile, setProfile] = useState<ProfileTest>();
	const [pvrooms, setPvrooms] = useState<Pvrooms[]>();

	useEffect(() => {
		chatsSocket.emit('getProfileForUser', (profiletest: ProfileTest) => {
			if (profiletest) {
				setProfile(profiletest);
				const allRooms: Room[] = profiletest.membership.map((memberWithLatestMessage) => memberWithLatestMessage.member.room);
				setRooms(allRooms);
				if (profiletest.pvrooms !== undefined)
					setPvrooms(profiletest.pvrooms);
			}
		});
	}, []);

	console.log('Profile', profile);

	useEffect(() => {
		const socketListeners: { event: string, handler: (response: any) => void }[] = [];

		const handleNewRoom = (response: Room) => {
			setRooms((prevRooms) => [response, ...prevRooms]);
		};

		const handleMessageSent = (newMessage: Message) => {
			const newRooms = [...rooms];
			const targetRoom = newRooms.find((room) => room.id === newMessage.roomId);
			if (targetRoom) {
				const filteredRooms = newRooms.filter((room) => room.id !== newMessage.roomId);
				setRooms([targetRoom, ...filteredRooms]);
			}
		};

		socketListeners.push({ event: 'newRoom', handler: handleNewRoom });
		socketListeners.push({ event: 'messageSent', handler: handleMessageSent });

		socketListeners.forEach(({ event, handler }) => {
			chatsSocket.on(event, handler);
		});

		return () => {
			socketListeners.forEach(({ event, handler }) => {
				chatsSocket.off(event, handler);
			});
		};
	}, [rooms]);

	const myMap = (room: Room, pvrooms: Pvrooms[], profile: ProfileTest) => {
		let channelclass = room.isChannel === true ? 'chatListItemChannel' : 'chatListItemPrivate';
		const roomId = room.id;
		let roomtitle;
		const matchingMember = profile.membership.find((memberWithLatestMessage) => memberWithLatestMessage.member.roomId === roomId);
		let isBanned = matchingMember ? matchingMember.member.ban : false;
		const textClass = isBanned ? 'banned-text' : '';
		if (isBanned)
			channelclass = 'chatListItemBan';
		const privateroom = pvrooms.find((pvrooms) => pvrooms.roomId == roomId);
		if (privateroom) {
			roomtitle = privateroom.username2;
			if (privateroom.blocked || privateroom.block) {
				channelclass = 'chatListItemBan';
				isBanned = true;
			}
		}
		else
			roomtitle = room.title;

		return (
			<li key={roomtitle}>
				<Link
					to={isBanned ? "#" : `/chat/${room.id}`}
					className={`link-text ${isBanned ? "banned-link" : ""}`}
					style={{ color: 'white', pointerEvents: isBanned ? "none" : "auto" }}
				>
					<div className={`chatListItemButton ${channelclass}`}>
						<span
							className={textClass}
							style={{ textDecoration: isBanned ? 'line-through' : 'none', color: isBanned ? 'black' : 'white' }}
						>
							{roomtitle}
						</span>
					</div>
				</Link>
			</li>
		);
	};


	return (
		<div className='w-100 h-100 d-flex flex-column'>
			{page === 'newChat' && <NewChat setPage={setPage} />}
			{page === 'chatList' && (
				<>
					<div className='d-flex w-100 align-items-center p-2 ps-4 ps-sm-5 bg-black'>
						<h4 className='white-text mx-auto my-0'>Chat</h4>
						<button className='new-chat ms-auto' onClick={() => setPage('newChat')} />
					</div>
					<div className='ps-sm-2 overflow-y-auto'>
						<ul className='py-1' >
							{(profile !== undefined && pvrooms !== undefined) ? rooms.map((room) => myMap(room, pvrooms, profile)) : null}
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
