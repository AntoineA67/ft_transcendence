import { useEffect } from "react"
import { userType } from "../../types/user"
import { useState } from "react"
import DefaultAvatar from '../assets/defaultAvatar.png'
import Friend from '../assets/Friend.svg'
import { socket } from "./socket"

type avatarProp = {
	size: number, 
	user: userType
}

export function Avatar({ size, user }: avatarProp) {
	const [avatar, setAvatar] = useState('')
	const [color, setColor] = useState('')
	const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'INGAME'>(user.status);
	
	useEffect(() => {
		console.log(user);
		// define behavior to user online status
		function onOnline(id: number) {
			user.id == id && setStatus('ONLINE');
		}
		function onOffline(id: number) {
			user.id == id && setStatus('OFFLINE');
		}
		function onIngame(id: number) {
			user.id == id && setStatus('INGAME');
		}
		socket.on('online', onOnline);
		socket.on('offline', onOffline);
		socket.on('ingame', onIngame);
		// set Avatar
		if (!user.avatar) {
			setAvatar(DefaultAvatar);
		} else {
			const base64 = btoa(
				new Uint8Array(user.avatar)
				.reduce((data, byte) => data + String.fromCharCode(byte), '')
			);
			// no need to decide file type, idk it just works
			setAvatar(`data:image/jpeg;base64,${base64}`)
		}
		return () => {
			socket.off('online', onOnline);
			socket.off('offline', onOffline);
			socket.off('ingame', onIngame);
		};
	}, []);

	useEffect(() => {
		status == 'ONLINE' && setColor('green');
		status == 'OFFLINE' && setColor('grey');
		status == 'INGAME' && setColor('red');
	}, [status])

	return (
		<>
			<div style={{
				height: `${size / 6}px`,
				width: `${size / 6}px`, 
				borderRadius: '50%',
				border: '2px solid white',
				backgroundColor: color,
				position: 'relative',
				left: `${size / 2}px`, 
				top: `${size / 4}px`
			}} />	
			<img 
				className='p-0 m-0'
				src={avatar} 
				style={{
					height: `${size}px`, 
					width: `auto`, 
					objectFit: 'contain', 
					clipPath: 'circle()', 
				}}
			/>			
		</>
	)
}

