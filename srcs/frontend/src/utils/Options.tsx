import { profileType, userType } from "../../types/user";
import { useEffect, useState } from "react";
import { friendsSocket, chatsSocket } from "./socket";
import { useNavigate } from "react-router-dom";
import { handlePlayClickinMess } from "../pages/Chat";

type OptionsProp = {
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType>>
}
export function Options({ profile, setProfile }: OptionsProp) {

	if (profile.friend == null || profile == null) {
		return (null)
	}
	return (
		<div className='d-flex flex-row'>
			<AddOption profile={{ ...profile }} setProfile={setProfile} />
			<ChatOption profile={{ ...profile }} setProfile={setProfile} />
			{profile.status === 'ONLINE' && <PongOption profile={{ ...profile }} setProfile={setProfile} />}
			<BlockOption profile={{ ...profile }} setProfile={setProfile} />
		</div>
	)
}

type optionProp = {
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType>>
}

export function AddOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Add' | 'Sent' | 'Friend!'>('Add')

	useEffect(() => {
		profile.sent ? setText('Sent') : setText('Add');
		profile.friend && setText('Friend!');
	}, [profile])

	useEffect(() => {
		// define socket listener
		function handleReqAccept(newFriend: userType) {
			if (newFriend.id === profile.id) {
				setProfile((prev) => ({ ...prev!, sent: false, friend: true }))
			}
		}
		function handleSendFriendReq(recver: userType) {
			if (recver.id === profile.id) {
				setProfile((prev) => ({ ...prev!, sent: true }))
			}
		}
		friendsSocket.on('friendReqAccept', handleReqAccept);
		friendsSocket.on('sendfriendReq', handleSendFriendReq);

		return (() => {
			friendsSocket.off('friendReqAccept', handleReqAccept);
			friendsSocket.off('sendfriendReq', handleSendFriendReq);
		})
	}, [profile])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text === 'Add') {
			friendsSocket.emit('sendReq', profile.username);
		}
	}

	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='addOption' onClick={handleClick} />
			<p className='magenta-text'>{text}</p>
		</div>
	)
}

export function BlockOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Block' | 'Unblock'>('Block');

	useEffect(() => {
		profile.block ? setText('Unblock') : setText('Block');
	}, [profile])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text === 'Block') {
			friendsSocket.emit('block', profile.id);
			setProfile((prev) => ({ ...prev!, block: true }))
		}
		if (text === 'Unblock') {
			friendsSocket.emit('unblock', profile.id);
			setProfile((prev) => ({ ...prev!, block: false }))
		}
	}

	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='blockOption' onClick={handleClick} />
			<p className='magenta-text'>{text}</p>
		</div>
	)
}

export function ChatOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Chat' | 'block'>('Chat');
	const navigate = useNavigate();

	useEffect(() => {
		function handleBlock() {
			setProfile((prev) => ({ ...prev!, block: true }))
		}
		function handleBlocked() {
			setProfile((prev) => ({ ...prev!, blocked: true }))
		}
		function handleUnblock() {
			setProfile((prev) => ({ ...prev!, block: false }))
		}
		function handleUnblocked() {
			setProfile((prev) => ({ ...prev!, blocked: false }))
		}
		friendsSocket.on('block', handleBlock)
		friendsSocket.on('blocked', handleBlocked)
		friendsSocket.on('unblock', handleUnblock)
		friendsSocket.on('unblocked', handleUnblocked)
		return (() => {
			friendsSocket.off('block', handleBlock)
			friendsSocket.off('blocked', handleBlocked)
			friendsSocket.off('unblock', handleUnblock)
			friendsSocket.off('unblocked', handleUnblocked)
		})

	}, [])

	useEffect(() => {
		(profile.block || profile.blocked) ? setText('block') : setText('Chat');
	}, [profile])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text === 'Chat') {
			chatsSocket.emit('createPrivateRoom', profile.username, (response: number) => {
				if (response > 0) {
					navigate(`/chat/${response}`);
				}
			});
		}
	}

	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='chatOption' onClick={handleClick} />
			<p className='magenta-text'>{text}</p>
		</div>
	)
}

export function PongOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Pong' | 'block'>('Pong');

	useEffect(() => {
		function handleBlock() {
			setProfile((prev) => ({ ...prev!, block: true }))
		}
		function handleBlocked() {
			setProfile((prev) => ({ ...prev!, blocked: true }))
		}
		function handleUnblock() {
			setProfile((prev) => ({ ...prev!, block: false }))
		}
		function handleUnblocked() {
			setProfile((prev) => ({ ...prev!, blocked: false }))
		}
		friendsSocket.on('block', handleBlock)
		friendsSocket.on('blocked', handleBlocked)
		friendsSocket.on('unblock', handleUnblock)
		friendsSocket.on('unblocked', handleUnblocked)
		return (() => {
			friendsSocket.off('block', handleBlock)
			friendsSocket.off('blocked', handleBlocked)
			friendsSocket.off('unblock', handleUnblock)
			friendsSocket.off('unblocked', handleUnblocked)
		})

	}, [])

	useEffect(() => {
		(profile.block || profile.blocked) ? setText('block') : setText('Pong');
	}, [profile])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text === 'Pong') {
			handlePlayClickinMess(profile.id, profile.username);
		}
	}

	return (
		<div className='d-flex flex-column align-items-center'>
			<button disabled={profile.status !== 'ONLINE'} className='pongOption' onClick={handleClick} />
			<p className={profile.status !== 'ONLINE' ? 'grey-text' : 'magenta-text'}>{text}</p>
		</div>
	)
}