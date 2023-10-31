
import { Link, Outlet, useLoaderData } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { chatsSocket, socket } from '../utils/socket';
import { useNavigate } from 'react-router-dom';
import { Message, Profile, Room, Member, Pvrooms, Block } from './ChatDto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentSlash, faGamepad, faPlay } from '@fortawesome/free-solid-svg-icons';
import { BsArrowUpRight } from 'react-icons/bs';
import { BsThreeDots } from "react-icons/bs";
import { MdGroup, MdGroups2 } from 'react-icons/md';
import { MdPublic, MdPublicOff } from 'react-icons/md';
import { CiLock, CiUnlock } from 'react-icons/ci';
import { FaChessKing, FaChessKnight, FaChessPawn } from 'react-icons/fa';
import { MdPersonOutline } from 'react-icons/md';
import { set } from "lodash-es";


type ChatBoxData = {
	messages: Message[],
	roomTitle: string,
	roomChannel: boolean,
	members: Member[],
	memberStatus: Member,
	private: boolean,
	password: boolean
}

export function ChatBox() {
	const { chatId } = useParams();
	const data = useLoaderData() as ChatBoxData;
	const [mess, setMess] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [roomTitle, setroomTitle] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [roomChannel, setRoomChannel] = useState<boolean>(true);
	const navigate = useNavigate();
	const messagesEndRef = useRef<HTMLUListElement | null>(null);
	const [profile, setProfile] = useState<Profile>();
	const [showSettings, setShowSettings] = useState(false);
	const [memberstatus, setMemberstatus] = useState<Member>();
	const [membersList, setMemberList] = useState<Member[]>([]);
	const [newRoomTitle, setNewRoomTitle] = useState<string>('');
	const [newRoomTitleSuccess, setnewRoomTitleSuccess] = useState<boolean>();
	const [newPasswordSucess, setnewPasswordSucess] = useState<boolean>();
	const [inviteUsername, setInviteUsername] = useState<string>('');
	const [inviteUsernameSuccess, setinviteUsernameSuccess] = useState<boolean>();
	const [newPassword, setNewPassword] = useState<string>('');
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [privateStatus, setPrivateStatus] = useState<boolean>(false);
	const [passwordStatus, setPasswordStatus] = useState<boolean>(false);

	useEffect(() => {
		setroomTitle(data.roomTitle);
		setMessages(data.messages);
		setRoomChannel(data.roomChannel);
		setMemberstatus(data.memberStatus);
		setMemberList(data.members);
		setPrivateStatus(data.private);
		setPasswordStatus(data.password);
		setnewRoomTitleSuccess(undefined);
		setinviteUsernameSuccess(undefined);
		setnewPasswordSucess(undefined);
		setShowSettings(false);
		setLoading(false);
		setMess('');

		chatsSocket.emit('getProfileForUser', (profile: Profile) => {
			if (profile) {
				setProfile(profile);
				setBlocks(profile.blocks);
			}
		});
	}, [chatId]);

	useEffect(() => {
		const socketListeners: { event: string; handler: (response: any) => void }[] = [];

		const handleUserLeaveChannel = (response: { userid: number, roomId: number }) => {
			if (response.userid !== profile?.id && response.roomId === parseInt(chatId || '', 10)) {
				setMemberList((prevMembersList) =>
					prevMembersList.filter((member) => member.userId !== response.userid)
				);
			}
			else {
				navigate('/chat');
			}
		};

		const handlenewmess = (newMessage: Message) => {
			if ((chatId && newMessage.roomId !== parseInt(chatId, 10))) return;
			const block = blocks.find((block) => block.blockedId === newMessage.userId);
			if (block || (memberstatus && memberstatus.ban)) return;
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		};

		const handlenewMember = (newMember: Member) => {
			console.log(newMember);
			const memberalreadyin = membersList.find((member) => member.userId === newMember.userId);
			if (memberalreadyin) return;
			if (chatId && newMember.roomId !== parseInt(chatId, 10)) return;
			setMemberList((prevMembersList) => [...prevMembersList, newMember]);
		}

		const handlenewRoomTitle = (response: { roomid: number; roomtitle: string }) => {
			if (response) {
				setroomTitle(response.roomtitle);
			}
		};

		const handlenewmemberStatus = (response: Member) => {
			if (response) {
				setMemberstatus(response);
				if (response.ban) {
					setMessages([]);
					setroomTitle('You have been banned');
					setMemberList([]);
				}
				else {
					chatsSocket.emit('getRoomData', chatId, (data: { messages: Message[], roomTitle: string, roomChannel: boolean, members: Member[], memberStatus: Member }) => {
						setroomTitle(data.roomTitle);
						setMessages(data.messages);
						setRoomChannel(data.roomChannel);
						setMemberstatus(data.memberStatus);
						setMemberList(data.members);
						setnewRoomTitleSuccess(undefined);
						setinviteUsernameSuccess(undefined);
						setShowSettings(false);
						setLoading(false);
						setMess('');
					});
				}
			}
		};

		const handlenewmemberListStatus = (response: Member) => {
			if (response) {
				setMemberList((prevMembersList) =>
					prevMembersList.map((member) => {
						if (member.userId === response.userId && response.userId !== profile?.id) {
							member = response;
						}
						return member;
					})
				);
			}
		};

		const handleDeleteRoom = (response: number) => {
			if (response === parseInt(chatId || '', 10)) {
				navigate('/chat');
			}
		}

		const handleNewProfile = (response: Profile) => {
			const roominfo = response.pvrooms.find((room) => room.roomId === parseInt(chatId || '', 10));
			if (roominfo?.blocked) {
				setProfile(response);
				setBlocks(response.blocks);
				setMessages([]);
				setroomTitle('You have been blocked by this user');
				setMemberList([]);
			}
			else if (roominfo?.blocked === false) {
				setProfile(response);
				setBlocks(response.blocks);
				setMessages(data.messages);
				setroomTitle(data.roomTitle);
				setMemberList(data.members);
			}
		}

		socketListeners.push({ event: 'UserLeaveChannel', handler: handleUserLeaveChannel });
		socketListeners.push({ event: 'messageSent', handler: handlenewmess });
		socketListeners.push({ event: 'newMember', handler: handlenewMember });
		socketListeners.push({ event: 'newRoomTitle', handler: handlenewRoomTitle });
		socketListeners.push({ event: 'newmemberStatus', handler: handlenewmemberStatus });
		socketListeners.push({ event: 'newmemberListStatus', handler: handlenewmemberListStatus });
		socketListeners.push({ event: 'deleteRoom', handler: handleDeleteRoom });
		socketListeners.push({ event: 'newProfile', handler: handleNewProfile });

		console.log('event listener');

		socketListeners.forEach(({ event, handler }) => {
			chatsSocket.on(event, handler);
		});

		return () => {
			console.log('event listener removed');
			socketListeners.forEach(({ event, handler }) => {
				chatsSocket.off(event, handler);
			});
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
	}, [messages, showSettings, profile]);

	const handleChangeRoomTitle = () => {
		if (newRoomTitle && newRoomTitle.trim() !== '') {
			chatsSocket.emit('changeRoomTitle', {
				roomId: chatId,
				roomtitle: newRoomTitle
			}, (response: boolean) => {
				if (response) {
					setroomTitle(newRoomTitle);
					setnewRoomTitleSuccess(true);
				}
				else
					setnewRoomTitleSuccess(false);
			})
		}
		setNewRoomTitle('');
	}

	const displayRoomTitle = () => {
		if (window.innerWidth < 780) {
			if (roomTitle.length > 10) {
				return roomTitle.substring(0, 5) + '...';
			}
		}
		return roomTitle;
	};

	const handleInviteUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (inviteUsername && inviteUsername.trim() !== '') {
			chatsSocket.emit('inviteUser', {
				roomId: chatId,
				username: inviteUsername,
			}, (response: Member) => {
				if (response.userId > 0) {
					setinviteUsernameSuccess(true);
				} else {
					setinviteUsernameSuccess(false);
				}
			});
		}
		setInviteUsername('');
	};


	const handleClick = () => {
		if (mess.trim()) {
			handleSendMessage();
		}
	};

	const handleSendMessage = () => {
		if (profile === undefined)
			return;
		if (mess.length > 10000) {
			alert('Message too long');
			return;
		}
		chatsSocket.emit('sendMessage', {
			content: mess,
			roomId: chatId,
		}, (response: boolean) => {
			if (!response) {
				alert('Erreur lors de l\'envoi du message');
				navigate('/chat');
			}
		});
		setMess('');
	};

	const handleLeaveChannel = (usertoKick: number) => {
		if (profile === undefined)
			return;
		chatsSocket.emit('UserLeaveChannel', {
			usertoKick: usertoKick,
			roomId: chatId,
		}, (response: boolean) => {
			if (response && profile.id === usertoKick) {
				navigate('/chat');
			}
			if (response) {
				setMemberList((prevMembersList) => prevMembersList.filter((member) => member.userId !== usertoKick));
			}
		});
	}

	const handleMuteDurationChange = (memberid: number, time: number, bool: boolean | null) => {
		if (!memberid || (time === undefined && (bool === null || !bool)))
			return;
		if (bool && bool == true)
			time = 0;
		chatsSocket.emit('muteMember', {
			memberId: memberid,
			duration: time,
			roomId: chatId
		}, (response: boolean) => {
			if (response) {
				setMemberList((prevMembersList) => prevMembersList.map((member) => {
					if (member.userId === memberid)
						member.mute = time > 0 ? new Date(Date.now() + time * 1000) : null;
					return member;
				}));
			}
		});
	};

	const handleBan = (memberid: number, actions: boolean) => {
		chatsSocket.emit('banMember', {
			memberId: memberid,
			roomId: chatId,
			action: actions,
		}, (response: boolean) => {
			if (response) {
				setMemberList((prevMembersList) => prevMembersList.map((member) => {
					if (member.userId === memberid)
						member.ban = !actions;
					return member;
				}));
			}
		}
		);
	};

	const handleBlock = (memberid: number, actions: boolean) => {
		if (profile === undefined) {
			return;
		}

		chatsSocket.emit('blockUser', {
			memberId: memberid,
			action: actions,
		}, (response: boolean) => {
			if (response) {
				setBlocks((prevBlocks) => {
					if (!actions) {
						return [...prevBlocks, { userId: profile.id, blockedId: memberid }];
					} else {
						return prevBlocks.filter((block) => block.blockedId !== memberid);
					}
				});
				if (!actions)
					setMessages((prevMessages) => prevMessages.filter((message) => message.userId !== memberid));
			}
		});
	};

	const handleKick = (memberid: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		chatsSocket.emit('UserLeaveChannel', {
			usertoKick: memberid,
			roomId: chatId
		}, (response: boolean) => {
			if (response)
				setMemberList((prevMembersList) => prevMembersList.filter((member) => member.userId !== memberid))
		})
	}

	const handleRoleChange = (memberid: number, role: string) => {
		chatsSocket.emit('changeRole', {
			memberId: memberid,
			roomid: chatId,
			owner: role === 'Owner' ? true : false,
			admin: role === 'Admin' ? true : false,
		}, (response: boolean) => {
			if (response) {
				setMemberList((prevMembersList) => prevMembersList.map((member) => {
					if (member.userId === memberid) {
						member.owner = role === 'Owner' ? true : false;
						member.admin = role === 'Admin' ? true : false;
					}
					return member;
				}
				));
				if (response && role === 'Owner') {
					setMemberstatus((prevMemberstatus) => {
						if (prevMemberstatus) {
							prevMemberstatus.owner = false;
							prevMemberstatus.admin = true;
						}
						return prevMemberstatus;
					});
				}
			}
		});
	}

	const handleChangePassword = () => {
		if (newPassword && newPassword.trim() !== '') {
			chatsSocket.emit('changePassword', {
				roomId: chatId,
				password: newPassword
			}, (response: boolean) => {
				if (response) {
					setNewPassword('');
					setnewPasswordSucess(true);
					setPasswordStatus(true);
				}
				else
					setnewPasswordSucess(false);
			})
		}
	}

	const handleDeletePassword = () => {
		chatsSocket.emit('changePassword', {
			roomId: chatId,
			password: ''
		}, (response: boolean) => {
			if (response) {
				setPasswordStatus(false);
				setnewPasswordSucess(undefined);
				setNewPassword('');
			}
		})
	}

	const handleDeleteChannel = () => {
		chatsSocket.emit('deleteChannel', chatId, (response: boolean) => {
			if (response) {
				navigate('/chat');
			}
		});
	}

	const myMap = (message: Message, profile: Profile) => {
		const classname = message.userId === profile.id ? 'messageBlue' : 'messagePink';
		const classuser = message.userId === profile.id ? 'justify-content-end' : 'justify-content-start';

		if (message.userId === profile.id) {
			message.username = profile.username;
		}

		return (
			<li className="message-container" key={message.id}>
				<div className={`d-flex ${classuser}`}>
					{message.userId !== profile.id && (
						<Link to={`/game/${message.userId}`} style={{ textDecoration: 'none', color: 'inherit', border: 'none', outline: 'none', cursor: 'pointer' }}>
							<span style={{ marginRight: '20px' }}>
								<FontAwesomeIcon icon={faPlay} />
							</span>
						</Link>
					)}
					<Link to={`/search/${message.username}`} style={{ textDecoration: 'none', color: 'inherit', border: 'none', outline: 'none', cursor: 'pointer' }}>
						<strong className='user-header'>
							{message.username}
						</strong>
					</Link>
				</div>
				<div className={`${classname}`}>{message.message}</div>
			</li>
		);
	};

	return (
		<div className="h-100 d-flex flex-column pb-5 pb-sm-0 " style={{ position: 'relative' }}>
			<div className="chat-container d-flex h-100">
				<div className="d-flex w-100 align-items-center p-1">
					<Link to="..">
						<button className="leftArrow m-2" title="Go Back"></button>
					</Link>
					<h4 className='white-text ms-2' title={roomTitle}>{displayRoomTitle()}</h4>
					<h4 className='ms-auto mr-3' style={{ margin: '0 5px' }} title={roomChannel ? "Group" : "Private message"}>{roomChannel ? <MdGroups2 /> : <MdGroup />}</h4>
					{roomChannel && <h4 className='mr-3' style={{ margin: '0 5px' }} title={privateStatus ? "Private" : "Public"}>{privateStatus ? <MdPublicOff /> : <MdPublic />}</h4>}
					{roomChannel && <h4 className='mr-3' style={{ margin: '0 5px' }} title={privateStatus ? "" : passwordStatus ? "Locked" : "Unlocked"}>{privateStatus ? '' : passwordStatus ? <CiLock /> : <CiUnlock />}</h4>}
					{roomChannel && <h4 className='mr-3' style={{ margin: '0 5px' }} title={memberstatus?.owner ? "Owner" : memberstatus?.admin ? "Admin" : "Member"}>{memberstatus?.owner ? <FaChessKing /> : memberstatus?.admin ? <FaChessKnight /> : <FaChessPawn />}</h4>}
					<button onClick={() => setShowSettings(!showSettings)} className="settings-button ms-auto mr-3" title="Settings"><BsThreeDots /></button>
				</div>
				{!showSettings && (
					<div className="p-5 flex-grow-2 overflow-y-auto">
						<ul
							ref={messagesEndRef}
							className="d-flex flex-column"
						>
							{profile !== undefined ? messages.map((message) => myMap(message, profile)) : null}
						</ul>
					</div>
				)}
				{!showSettings && (
					<div className="mt-auto p-3 d-flex align-items-center">
						<input
							className={`${memberstatus ? (memberstatus.ban ? 'banned-text' : '') : ''}`}
							value={mess}
							onChange={(e) => setMess(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={
								memberstatus
									? memberstatus.ban || (memberstatus.mute !== null && new Date(memberstatus.mute) > new Date())
										? true
										: !roomChannel && blocks.find((block) => block.blockedId === membersList.find((member) => member.userId !== profile?.id)?.userId)
											? true
											: false
									: true
							}
							placeholder={
								memberstatus
									? (memberstatus.ban && roomChannel)
										? 'You\'re banned...'
										: memberstatus.mute !== null && new Date(memberstatus.mute) > new Date()
											? 'You are muted...'
											: !roomChannel && blocks.find((block) => block.blockedId === membersList.find((member) => member.userId !== profile?.id)?.userId)
												? 'You are blocking this user...'
												: 'Write a message...'
									: ''
							}
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
				)}
			</div>
			{showSettings && (
				<div className="w-100 h-75 d-flex flex-column overflow-auto" style={{ position: 'absolute', zIndex: '2', marginTop: '5rem' }}>
					<div className="align-items-center d-flex flex-column p-5">
						{memberstatus?.admin && roomChannel && (
							<>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<h4 className='white-text'>Settings of #{chatId}</h4>
								</div>
								<input
									id="roomTitleInput"
									className={`form-control ${newRoomTitleSuccess === true ? 'is-valid' : newRoomTitleSuccess === false ? 'is-invalid' : ''}`}
									type="text"
									placeholder="New Room name"
									value={newRoomTitle}
									onChange={(e) => setNewRoomTitle(e.target.value)}
									disabled={!memberstatus?.admin}
								/>
								<button className='btn btn-outline-secondary my-3 ' type='submit' onClick={handleChangeRoomTitle} disabled={!newRoomTitle.trim() || newRoomTitle.length > 25}>Valider</button>
								{memberstatus?.owner && !privateStatus && (
									<input
										id="Newpassword"
										className={`form-control ${newPasswordSucess === true ? 'is-valid' : newPasswordSucess === false ? 'is-invalid' : ''}`}
										type="text"
										placeholder="New Password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}

										disabled={!memberstatus?.owner}
									/>)}
								<div style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
									{memberstatus?.owner && !privateStatus && (
										<button
											className='btn btn-outline-secondary my-3 mr-2'
											type='submit'
											onClick={handleChangePassword}
											disabled={!memberstatus.owner || !newPassword.trim()}
										>
											Update
										</button>
									)}
									{memberstatus?.owner && !privateStatus && passwordStatus && (
										<button
											className='btn btn-outline-secondary my-3'
											type='submit'
											onClick={handleDeletePassword}
											disabled={!memberstatus.owner}
										>
											Delete
										</button>
									)}
								</div>
								<input
									id="inviteUserInput"
									className={`form-control ${inviteUsernameSuccess === true ? 'is-valid' : inviteUsernameSuccess === false ? 'is-invalid' : ''}`}
									type="text"
									placeholder="Invite user by username"
									value={inviteUsername}
									onChange={(e) => setInviteUsername(e.target.value)}
								/>
								<button className='btn btn-outline-secondary w-20 my-3' type='submit' onClick={(e) => handleInviteUser(e)} disabled={!inviteUsername.trim()}>Invite</button>
							</>
						)}
						{roomChannel && roomTitle && profile && memberstatus && !memberstatus.ban && <button className="btn btn-danger mt-3 mb-1" onClick={() => handleLeaveChannel(profile?.id)}>Leave</button>}
						{roomChannel && roomTitle && profile && memberstatus && memberstatus.owner && <button className="btn btn-danger mb-3" onClick={() => handleDeleteChannel()}>Delete Channel</button>}
					</div>
					<ul className="members-list">
						{membersList
							.filter((member) => member.userId !== profile?.id)
							.map((member) => (
								<li key={member.id} className="member d-flex flex-wrap">
									<Link to={`/search/${member.username}`} style={{ textDecoration: 'none' }}>
										<div className="member-details">
											<span className="member-username">{member.username}</span>
											{roomChannel && (<span className="member-role">
												{member.owner || member.admin ? (member.owner ? 'Owner' : 'Admin') : 'Member'}
											</span>)}
										</div>
									</Link>
									<div className="member-actions d-flex flex-wrap">
										{roomChannel && !member.owner && (memberstatus?.admin || memberstatus?.owner) && <select
											defaultValue={member.owner || member.admin ? (member.owner ? 'Owner' : 'Admin') : 'Member'}
											onChange={(e) => handleRoleChange(member.userId, e.target.value)}
										>
											{memberstatus.owner && <option value="Owner">Owner</option>}
											<option value="Admin">Admin</option>
											<option value="Member">Member</option>
										</select>}
										{roomChannel && !member.owner && (memberstatus?.admin || memberstatus?.owner) && <button
											className={`action-button cursor-button ${member.mute && new Date(member.mute) > new Date() ? 'action-disabled' : ''}`}
											onClick={() => handleMuteDurationChange(member.userId, member.muteduration, member.mute && new Date(member.mute) > new Date())}
										>
											{member.mute && new Date(member.mute) > new Date() ? 'Unmute' : 'Mute'}
										</button>}
										{roomChannel && !member.owner && (memberstatus?.admin || memberstatus?.owner) && (!member.mute || new Date(member.mute) < new Date()) && (
											<select
												defaultValue={member.muteduration}
												onChange={(e) => member.muteduration = parseInt(e.target.value)}
											>
												<option value="">Time</option>
												<option value="300">5 min</option>
												<option value="600">10 min</option>
												<option value="3600">1 h</option>
												<option value="7200">2 h</option>
												<option value="86400">24 h</option>
											</select>
										)}
										{roomChannel && !member.owner && (memberstatus?.admin || memberstatus?.owner) && <button
											className={`action-button cursor-button ${member.ban ? 'action-disabled' : ''}`}
											onClick={() => handleBan(member.userId, member.ban)}
										>
											{member.ban ? 'Unban' : 'Ban'}
										</button>}
										<button
											className="action-button"
											onClick={() => {
												const block = blocks.find((block) => block.blockedId === member.userId);
												handleBlock(
													member.userId,
													block ? true : false
												)
											}
											}
										>
											{blocks.find((block) => block.blockedId === member.userId)
												? 'Unblock'
												: 'Block'}
										</button>
										{roomChannel && !member.owner && (memberstatus?.owner || memberstatus?.admin) && <button
											className="action-button"
											onClick={(e) => handleKick(member.userId, e)}
										>
											Kick
										</button>}
									</div>
								</li>
							))}
					</ul>
				</div>
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

		const password = !isPublic ? '' : createPassword;
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
		<div className='h-100 d-flex flex-column p-1 pb-5 white-text overflow-y-auto'>
			<div>
				<button className='leftArrow' onClick={() => setPage('chatList')} />
			</div>
			<div>
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
					{!isPublic ? (
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
								placeholder='Password ?'
							/>
							<button type='submit' className='btn btn-outline-secondary' disabled={!create.trim()}>
								Create
							</button>
						</div>
					)}
				</form>
			</div>
		</div>
	);


}


export function ChatList() {
	const [page, setPage] = useState<'chatList' | 'newChat'>('chatList');
	const [rooms, setRooms] = useState<Room[]>([]);
	const [profile, setProfile] = useState<Profile>();
	const [pvrooms, setPvrooms] = useState<Pvrooms[]>();
	const [blocks, setBlocks] = useState<Block[]>([]);

	useEffect(() => {
		chatsSocket.emit('getProfileForUser', (profile: Profile) => {
			if (profile) {
				setProfile(profile);
				setBlocks(profile.blocks);
				const allRooms: Room[] = profile.membership.map((memberWithLatestMessage) => memberWithLatestMessage.member.room);
				setRooms(allRooms);
				if (profile.pvrooms !== undefined)
					setPvrooms(profile.pvrooms);
			}
		});
	}, []);

	useEffect(() => {
		const socketListeners: { event: string; handler: (response: any) => void }[] = [];

		const handleNewRoom = (response: Room) => {
			if (response) {
				const roomExists = rooms.find((room) => room.id === response.id);
				if (!roomExists) {
					setRooms((prevRooms) => [response, ...prevRooms]);
				}
			}
		};

		const handlenewRoomTitle = (response: { roomid: number; roomtitle: string }) => {
			if (response) {
				setRooms((prevRooms) =>
					prevRooms.map((room) => {
						if (room.id === response.roomid) {
							room.title = response.roomtitle;
						}
						return room;
					})
				);
			}
		};

		const handleMessageSent = (newMessage: Message) => {
			const newRooms = [...rooms];
			if (newMessage.userId === blocks.find((block) => block.blockedId === newMessage.userId)?.blockedId) return;
			const targetRoom = newRooms.find((room) => room.id === newMessage.roomId);
			if (targetRoom) {
				const filteredRooms = newRooms.filter((room) => room.id !== newMessage.roomId);
				setRooms([targetRoom, ...filteredRooms]);
			}
		};

		const handleUserLeaveChannel = (response: { userid: number, roomId: number }) => {
			if (response && response.userid === profile?.id) {
				setRooms((prevRooms) => prevRooms.filter((room) => room.id !== response.roomId));
			}
		};

		const handlenewProfile = (response: Profile) => {
			if (response) {
				setProfile(response);
				setBlocks(response.blocks);
				const allRooms: Room[] = response.membership.map((memberWithLatestMessage) => memberWithLatestMessage.member.room);
				setRooms(allRooms);
				if (response.pvrooms !== undefined)
					setPvrooms(response.pvrooms);
			}
		}

		const handledeleteRoom = (response: number) => {
			if (response) {
				setRooms((prevRooms) => prevRooms.filter((room) => room.id !== response));
			}
		}

		socketListeners.push({ event: 'newRoom', handler: handleNewRoom });
		socketListeners.push({ event: 'messageSent', handler: handleMessageSent });
		socketListeners.push({ event: 'newRoomTitle', handler: handlenewRoomTitle });
		socketListeners.push({ event: 'UserLeaveChannel', handler: handleUserLeaveChannel });
		socketListeners.push({ event: 'newProfile', handler: handlenewProfile });
		socketListeners.push({ event: 'deleteRoom', handler: handledeleteRoom });

		socketListeners.forEach(({ event, handler }) => {
			chatsSocket.on(event, handler);
		});

		return () => {
			socketListeners.forEach(({ event, handler }) => {
				chatsSocket.off(event, handler);
			});
		};
	}, [rooms]);


	const myMap = (room: Room, pvrooms: Pvrooms[], profile: Profile) => {
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
			if (privateroom.blocked) {
				channelclass = 'chatListItemBan';
				isBanned = true;
			}
		}
		else
			roomtitle = room.title;

		return (
			<li key={room.id}>
				<Link
					to={isBanned ? "#" : `/chat/${room.id}`}
					className={`white-text ${isBanned ? "banned-link" : ""}`}
					style={{ pointerEvents: isBanned ? "none" : "auto" }}
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
