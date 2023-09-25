import { useEffect } from "react"
import { userType } from "../../types/user"
import { useState } from "react"

type avatarProp = {
	size: number, 
	user: userType
}

export function Avatar({ size, user }: avatarProp) {
	const [avatar, setAvatar] = useState('')
	const [color, setColor] = useState('')
	
	useEffect(() => {
		
		// define behavior to user online status
		
		user.status == 'ONLINE' && setColor('green');
		user.status == 'OFFLINE' && setColor('grey');
		user.status == 'INGAME' && setColor('red');
		if (!user.avatar) return ;
		const base64 = btoa(
			new Uint8Array(user.avatar)
				.reduce((data, byte) => data + String.fromCharCode(byte), '')
		);
		setAvatar(`data:image/jpeg;base64,${base64}`)
	}, [user]);

	return (
		<>
			<div style={{
				height: `${size / 6}px`,
				width: `${size / 6}px`, 
				borderRadius: '50%',
				backgroundColor: color,
				position: 'relative',
				left: `${size / 3}px`, 
				top: `${size / 4}px`
			}} />	
			<img 
				className='p-0 m-0'
				src={avatar} 
				style={{
					maxHeight: `${size}px`, 
					maxWidth: `auto`, 
					objectFit: 'contain', 
					clipPath: 'circle()', 
				}}
			/>			
		</>
	)
}

