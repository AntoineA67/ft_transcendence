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
	
		return () => {
			socket.off('online', onOnline);
			socket.off('offline', onOffline);
			socket.off('ingame', onIngame);
		};
	}, []);
	
	useEffect(() => {
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
	}, [user])

	useEffect(() => {
		status == 'ONLINE' && setColor('green');
		status == 'OFFLINE' && setColor('grey');
		status == 'INGAME' && setColor('red');
	}, [status])

	return (
		<div style={{position: 'relative'}}>
			<span style={{
				height: `15px`,
				width: `15px`, 
				borderRadius: '50%',
				border: '2px solid white',
				backgroundColor: color,
				position: 'absolute',
				left: `${size / 1.1}px`, 
			}} />	
			<img 
				src={avatar} 
				style={{
					height: `${size}px`, 
					width: `auto`, 
					objectFit: 'contain', 
					clipPath: 'circle()', 
				}}
			/>			
		</div>
	)
}

