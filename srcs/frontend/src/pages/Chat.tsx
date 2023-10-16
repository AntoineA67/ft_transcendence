import '../styles/ProfileSetting.css';
import '../styles/Chat.css';
import { Link, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { chatsSocket } from '../utils/socket';
import { useNavigate } from 'react-router-dom';
import { Message, ProfileTest, Room, Member, Pvrooms } from './ChatDto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentSlash } from '@fortawesome/free-solid-svg-icons';
import { BsArrowUpRight } from 'react-icons/bs';
import { RiVolumeMuteFill, RiDeleteBin6Line, RiLogoutCircleRLine } from 'react-icons/ri';
import { BsThreeDots } from "react-icons/bs";

export function ChatBox() {
	const { chatId } = useParams();
	const [mess, setMess] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [roomTitle, setroomTitle] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [roomChannel, setRoomChannel] = useState<boolean>(true);
	const navigate = useNavigate();
	const messagesEndRef = useRef<HTMLUListElement | null>(null);
	const [profile, setProfile] = useState<ProfileTest>();
	const [showSettings, setShowSettings] = useState(false);
	const [memberstatus, setMemberstatus] = useState<Member>();
	const [membersList, setMemberList] = useState<Member[]>([]);

	useEffect(() => {
		chatsSocket.emit('getRoomData', chatId, (data: { messages: Message[], roomTitle: string, roomChannel: boolean, members: Member[], memberStatus: Member }) => {
			if (!data) {
				navigate('/chat');
			}
			setroomTitle(data.roomTitle);
			setMessages(data.messages);
			setRoomChannel(data.roomChannel);
			setMemberstatus(data.memberStatus);
			setMemberList(data.members);
			setLoading(false);
		});

		chatsSocket.emit('getProfileForUser', (profiletest: ProfileTest) => {
			if (profiletest) {
				setProfile(profiletest);
			}
		});

		function fc(newMessage: Message) {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		}
		chatsSocket.on('messageSent', fc);
		return () => {
			chatsSocket.off('messageSent', fc);
		};
	}, [chatId]);

	console.log('MemberList', membersList);

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

	const handleSettings = () => {
		setShowSettings(!showSettings);
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

	const myMap = (message: Message, profile: ProfileTest, member: Member | undefined, roomChannel: boolean) => {
		const classname = message.userId === profile.id ? 'messageBlue' : 'messagePink';
		const classuser = message.userId === profile.id ? 'userBlue' : 'userPink';
		const formattedTime = new Date(message.send_date).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});

		let role = '';
		if (member === undefined) {
			role = 'Member - ';
		}

		if (roomChannel === true && member !== undefined) {
			role = member.owner ? 'Owner' : member.admin ? 'Admin' : member.ban ? 'Banned' : 'Member';
			role += ' - ';
		}

		if (message.userId === profile.id) {
			message.username = profile.username;
		}

		return (
			<div className="message-container" key={message.id}>
				<strong className={`message ${classuser}`}>
					{message.username} - {role}
					{formattedTime}
				</strong>
				<div className={`message ${classname}`}>{message.message}</div>
			</div>
		);
	};

	return (
		<div className="h-100 d-flex">
			<div className="chat-content flex-grow-1">
				<div className="d-flex w-100 align-items-center p-1 ps-sm-5" style={{ backgroundColor: '' }}>
				<Link to="..">
					<button className="goBack"></button>
				</Link>
					<h4 style={{ color: 'white', margin: 'auto 0' }}>{roomTitle}</h4>
					<button onClick={handleSettings} className="settings-button ms-auto mr-3"><BsThreeDots /></button>
				</div>
				<div className="p-5 flex-grow" style={{ overflowY: 'auto' }}>
					<ul
						ref={messagesEndRef}
						className="nostyleList d-flex flex-column"
						style={{ color: 'white', minHeight: 'calc(100vh - 100px)' }}
					>
						{profile !== undefined ? messages.map((message) => myMap(message, profile, memberstatus, roomChannel)) : null}
					</ul>
				</div>
				<div className="mb-5 mb-sm-0 p-3  d-flex align-items-center">
					<input
						className={`p-2 flex-grow-1 ${memberstatus ? (memberstatus.ban ? 'banned-text' : '') : ''}`}
						style={{ borderRadius: '10px' }}
						value={mess}
						onChange={(e) => setMess(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={memberstatus ? (memberstatus.ban) : true}
						placeholder={memberstatus ? (memberstatus.ban ? 'You\'re banned/blocked or you\'re blocking the person...' : 'Write a message...') : ''}
					/>
					<button
						className="send-message"
						onClick={() => {
							if (memberstatus && !memberstatus.ban) {
								handleClick();
							}
						}}
						disabled={memberstatus && memberstatus.ban}
					>
					</button>
				</div>
			</div>
			{showSettings && (
				<ul className="members-list">
					{[
						...membersList.filter((member) => member.owner || member.admin),
						...membersList.filter((member) => !member.owner && !member.admin),
					].map((member) => (
						<li key={member.id} className="member">
							<div className="member-details">
								<span className="member-username">{member.username}</span>
								<span className="member-role">
									{member.owner || member.admin ? (member.owner ? 'Owner' : 'Admin') : 'Member'}
								</span>
							</div>
							<div className="member-actions">
								<RiVolumeMuteFill className="mute-icon" />
								<RiDeleteBin6Line className="ban-icon" />
								<RiLogoutCircleRLine className="kick-icon" />
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function NewChat({ setPage }: { setPage: React.Dispatch<React.SetStateAction<"chatList" | "newChat">> }) {
	const [nick, setNick] = useState('');
	const [join, setJoin] = useState('');
	const [create, setCreate] = useState('');
	const [roomId, setRoomId] = useState('');
	const [password, setPassword] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [createPassword, setCreatePassword] = useState('');

	const navigate = useNavigate();

	const handleCreateGroup = () => {
		if (create.trim() === '') return;

		const password = isPublic ? '' : createPassword;
		const roomdata = {
			roomTitle: create,
			isPublic: isPublic,
			password: password,
		};
		chatsSocket.emit('createChannelRoom', roomdata, (response: number) => {
			if (response > 0) {
				setPage('chatList');
				navigate(`/chat/${response}`);
			} else {
				alert(`Error while creating room ${create}`);
				setCreate('');
			}
		});
	}

	const handlePrivateMessage = () => {
		if (nick.trim() === '') return;
		chatsSocket.emit('createPrivateRoom', nick, (response: number) => {
			if (response > 0) {
				setPage('chatList');
				navigate(`/chat/${response}`);
			} else {
				alert(`Error while creating room with ${nick}`);
				setNick('');
			}
		});
	}

	const handleJoinGroup = () => {
		if (join.trim() === '' || roomId.trim() === '') return;
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
		<div className='w-100 h-100 d-flex flex-column p-1 pb-5 pb-sm-0 m-0' style={{ color: 'white', overflowY: 'auto' }}>
			<button className='cross ms-auto' onClick={() => setPage('chatList')} />

			<form className='form-controlchat d-flex flex-column align-items-center p-2 gap-2' onSubmit={(e) => {
				e.preventDefault();
				handlePrivateMessage();
			}}>
				<label className='w-75'>Priv Message:</label>
				<input
					id='private-message'
					value={nick}
					onChange={(e) => setNick(e.target.value)}
					className='w-75 form-control with-white-placeholder'
					placeholder='Username'
				/>
				<button type='submit' className='btn btn-outline-secondary w-75' disabled={!nick.trim()}>
					Send
				</button>
			</form>

			<div style={{ marginBottom: '40px' }}></div>

			<form className='form-controlchat d-flex flex-column align-items-center p-2 gap-2' onSubmit={(e) => {
				e.preventDefault();
				handleJoinGroup();
			}}>
				<label className='w-75'>Join Group:</label>
				<input
					id='groupname'
					value={join}
					onChange={(e) => setJoin(e.target.value)}
					className='w-75 form-control with-white-placeholder'
					placeholder='Group Name'
				/>
				<input
					type='text'
					id='roomID'
					value={roomId}
					onChange={(e) => setRoomId(e.target.value)}
					className='w-75 form-control with-white-placeholder'
					placeholder='Room ID'
				/>
				<input
					type='password'
					id='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className='w-75 form-control with-white-placeholder'
					placeholder='Password'
				/>
				<button type='submit' className='btn btn-outline-secondary w-75' disabled={!roomId.trim()}>
					Join
				</button>
			</form>

			<div style={{ marginBottom: '40px' }}></div>

			<form className='form-controlchat d-flex flex-column align-items-center p-2 gap-2' onSubmit={(e) => {
				e.preventDefault();
				handleCreateGroup();
			}}>
				<label className='d-flex flex-column align-items-center p-2 gap-2 mr-2'>Create Group:</label>
				<div className='d-flex flex-column align-items-center form-group'>
					<div className='custom-select'>
						<select
							id="isPublic"
							value={isPublic ? "public" : "private"}
							onChange={(e) => setIsPublic(e.target.value === "public")}
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
					</div>
				</div>
				<input
					id='groupnamecreate'
					value={create}
					onChange={(e) => setCreate(e.target.value)}
					className='w-75 form-control with-white-placeholder'
					placeholder='Group Name'
				/>
				{isPublic ? (
					<button type='submit' className='btn btn-outline-secondary w-75' disabled={!create.trim()}>
						Create
					</button>
				) : (
					<div className='d-flex flex-column align-items-center p-2 gap-2'>
						<input
							type='password'
							id='createPassword'
							value={createPassword}
							onChange={(e) => setCreatePassword(e.target.value)}
							className='w-75 form-control with-white-placeholder'
							placeholder='Password'
						/>
						<button type='submit' className='btn btn-outline-secondary w-75' disabled={!create.trim()}>
							Create
						</button>
					</div>
				)}
			</form>
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
			if (response) {
				const roomExists = rooms.find((room) => room.id === response.id);
				if (!roomExists) {
					setRooms((prevRooms) => [response, ...prevRooms]);
				}
			}
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
					<div className='d-flex w-100 align-items-center p-2 ps-4 ps-sm-5' style={{ backgroundColor: '' }}>
						<h4 style={{ color: 'white', margin: 'auto 0' }}>Chat</h4>
						<div className='ms-auto'>
							<button className='new-chat ms-auto' onClick={() => setPage('newChat')} />
						</div>
					</div>
					<div className='ps-sm-2' style={{ overflowY: 'auto' }}>
						{rooms.length > 0 ? (
							<ul className='nostyleList py-1'>
								{(profile !== undefined && pvrooms !== undefined) ? rooms.map((room) => myMap(room, pvrooms, profile)) : null}
							</ul>
						) : (
							<div className='d-flex align-items-center justify-content-center w-100 h-100'>
								<div className='text-center'>
									<BsArrowUpRight style={{ fontSize: '3rem', color: 'pink', opacity: '50%' }} />
									<h5 style={{ fontWeight: 'bold', fontSize: '1rem', color: 'pink', opacity: '50%' }}>Let's start by creating or joining an existing room.</h5>
								</div>
							</div>
						)}
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
		<div className='container-fluid h-100'>
			<div className='row h-100'>
				<div className={`col-12 col-sm-3 p-0 m-0 h-100 ${classname1}`}>
					<ChatList />
				</div>
				<div className={`col-12 col-sm-9 p-0 m-0 h-100 ${classname2}`}>
					{location.pathname.startsWith('/chat/') ? (
						<Outlet />
					) : (
						<div className="d-flex align-items-center justify-content-center w-100 h-100">
							<div className="text-center">
								<FontAwesomeIcon icon={faCommentSlash} style={{ fontSize: '3rem', color: 'pink', opacity: '50%' }} />
								<p style={{ fontWeight: 'bold', marginTop: '1rem', fontSize: '1rem', color: 'pink', opacity: '50%' }}>No Chat Selected</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
