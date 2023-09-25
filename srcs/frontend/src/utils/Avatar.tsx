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
		
		if (!user.avatar) return ;
		const base64 = btoa(
			new Uint8Array(user.avatar)
				.reduce((data, byte) => data + String.fromCharCode(byte), '')
		);
		setAvatar(`data:image/jpeg;base64,${base64}`)
		user.status == 'ONLINE' && setColor('green');
		user.status == 'OFFLINE' && setColor('grey');
		user.status == 'INGAME' && setColor('red');
	}, [user]);

	return (
		<div className='d-flex justify-content-center align-items-center'
			style={{
				width: `${size}px`, 
				height: `${size}px`, 
				borderRadius: '50%',
				border: `3px solid ${color}`
			}}>
			<img 
				src={avatar} 
				style={{
					height: `${size}px`, 
					width: 'auto'
				}}
			/>			
		</div>
	)
}

