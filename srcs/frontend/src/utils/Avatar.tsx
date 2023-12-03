import { useEffect } from "react"
import { userType } from "../../types/user"
import { useState } from "react"
import DefaultAvatar from '../assets/defaultAvatar.png'
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
			user.id === id && setStatus('ONLINE');
		}
		function onOffline(id: number) {
			user.id === id && setStatus('OFFLINE');
		}
		function onIngame(id: number) {
			user.id === id && setStatus('INGAME');
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
		status === 'ONLINE' && setColor('green');
		status === 'OFFLINE' && setColor('grey');
		status === 'INGAME' && setColor('red');
	}, [status])

	useEffect(() => {
		socket.emit('getUser', user.id, (res: userType) => {
			setStatus(res.status);
		})
		// set Avatar
		if (!user.avatar) {
			setAvatar(DefaultAvatar);
		} else {
			setAvatar(user.avatar);
		}
	}, [user])

	return (
		<div
			className='position-relative'
			style={{ width: `${size}px`, height: `${size}px` }}
		>
			<img src={avatar} alt="Avatar" className='user-avatar' />
			<span
				className='user-status'
				style={{ backgroundColor: color }}
			/>
		</div>
	)
}

