import { profileType, userType } from "../../types/user";
import { useEffect, useInsertionEffect, useState } from "react";
import { socket } from "./socket";

type OptionsProp = {
	key: number  //profile id
	profile: profileType,
}
export function Options(prop: OptionsProp) {
	const [ profile, setProfile ] = useState<profileType>(prop.profile);

	return (
		<div className='d-flex flex-row'>
			<AddOption  profile={profile}  setProfile={setProfile} />
			<ChatOption profile={profile} setProfile={setProfile}/>
			<PongOption profile={profile} setProfile={setProfile}/>
			<BlockOption profile={profile} setProfile={setProfile} />
		</div>
	)
}

type optionProp = {
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType>>
}

export function AddOption({profile, setProfile}: optionProp) {
	const [text, setText] = useState<'Add' | 'Sent' | 'Friend!'>('Add')
	
	useEffect(() => {
		// define initial value for text
		profile.sent && setText('Sent');
		profile.friend && setText('Friend!');
		// define socket listener
		function handleReqAccept(newFriend: userType) {
			(newFriend.id == profile.id) && setProfile(
				{... profile, sent: false, friend: true }
			)
		}
		socket.on('friendReqAccept', handleReqAccept);
		
		return (() => {
			socket.off('friendReqAccept', handleReqAccept);
		})
	}, [])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text == 'Add') {
			socket.emit('sendReq', profile.username);
			setProfile({... profile, sent: true})
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
		profile.block && setText('Unblock');
		!profile.block && setText('Block');
	}, [])
	
	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		if (text == 'Block') {
			socket.emit('block', profile.id);
			setProfile({ ...profile, block: true })
			setText('Unblock')
		}
		if (text == 'Unblock') {
			socket.emit('unblock', profile.id);
			setProfile({ ...profile, block: false })
			setText('Block')
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
	const [text, setText] = useState<'Chat' | 'blocked'>('Chat');

	useEffect(() => {
		profile.blocked && setText('blocked');
	}, [])

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
	const [text, setText] = useState<'Pong' | 'blocked'>('Pong');

	useEffect(() => {
		profile.blocked && setText('blocked');
	}, [])

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