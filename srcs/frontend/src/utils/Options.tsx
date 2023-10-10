import { profileType, userType } from "../../types/user";
import { useEffect, useState } from "react";
import { socket, friendsSocket } from "./socket";

type OptionsProp = {
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType | null>> 
}
export function Options({profile, setProfile}: OptionsProp) {

	console.log('profile: ', profile);
	if (profile.friend == null || profile == null) {
		return (null)
	}
	return (
		<div className='d-flex flex-row'>
			<AddOption  profile={{... profile}}  setProfile={setProfile} />
			<ChatOption profile={{ ...profile }} setProfile={setProfile}/>
			<PongOption profile={{ ...profile }} setProfile={setProfile}/>
			<BlockOption profile={{ ...profile }} setProfile={setProfile} />
		</div>
	)
}

type optionProp = {
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType | null>>
}

export function AddOption({profile, setProfile}: optionProp) {
	const [text, setText] = useState<'Add' | 'Sent' | 'Friend!'>('Add')
	
	useEffect(() => {
		profile.sent ? setText('Sent') : setText('Add');
		profile.friend && setText('Friend!');
	}, [profile])
	
	useEffect(() => {
		// define socket listener
		function handleReqAccept(newFriend: userType) {
			if (newFriend.id == profile.id) {
				setProfile((prev) => ({... prev!, sent: false, friend: true }))			
			}
		}
		function handleSendFriendReq(recver: userType) {
			console.log('recver: ', recver)
			console.log('profile: ', profile)
			if (recver.id == profile.id) {
				setProfile((prev) => ({... prev!, sent: true}))
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
		if (text == 'Add') {
			friendsSocket.emit('sendReq', profile.username);
			// setProfile((prev) => ({... prev!, sent: true}))
		}
	}
	
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='addOption' onClick={handleClick}/>
			<p style={{ color: '#be2693' }}>{text}</p>
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
		if (text == 'Block') {
			friendsSocket.emit('block', profile.id);
			setProfile((prev) => ({ ... prev!, block: true }))
		}
		if (text == 'Unblock') {
			friendsSocket.emit('unblock', profile.id);
			setProfile((prev) => ({ ...prev!, block: false }))
		}
	}

	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='blockOption' onClick={handleClick} />
			<p style={{ color: '#be2693' }}>{text}</p>
		</div>
	)
}

export function ChatOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Chat' | 'block'>('Chat');

	useEffect(() => {
		function handleBlock() {
			setProfile((prev) => ({... prev!, block: true}))
		}
		function handleBlocked() {
			setProfile((prev) => ({... prev!, blocked: true}))
		}
		function handleUnblock() {
			setProfile((prev) => ({... prev!, block: false}))
		}
		function handleUnblocked() {
			setProfile((prev) => ({... prev!, blocked: false}))
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
		if (text == 'Chat') {
			// do something
		}
	}
	
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='chatOption' onClick={handleClick} />
			<p style={{ color: '#be2693' }}>{text}</p>
		</div>
	)
}

export function PongOption({ profile, setProfile }: optionProp) {
	const [text, setText] = useState<'Pong' | 'block'>('Pong');

	useEffect(() => {
		function handleBlock() {
			setProfile((prev) => ({ ... prev!, block: true }))
		}
		function handleBlocked() {
			setProfile((prev) => ({ ... prev!, blocked: true }))
		}
		function handleUnblock() {
			setProfile((prev) => ({ ... prev!, block: false }))
		}
		function handleUnblocked() {
			setProfile((prev) => ({ ... prev!, blocked: false }))
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
		if (text == 'Pong') {
			// do something
		}
	}
	
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='pongOption' onClick={handleClick} />
			<p style={{ color: '#be2693'}}>{text}</p>
		</div>
	)
}