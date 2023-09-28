import { profileType } from "../../types/user";
import { useEffect, useState } from "react";

type OptionsProp = {
	profile: profileType
}
export function Options(prop: OptionsProp) {
	const [friendText] = useState<'Add' | 'Sent' | 'Friend!'>('Add')
	const [blockText] = useState<'Block' | 'Unblock'>('Block');
	const [chatText] = useState<'Chat' | 'blocked'>('Chat');
	const [ profile, setProfile ] = useState(prop.profile)

	// define socket event
	// profile should be updated on socket event, thus rerendering
	// show correct text according to relationship
	useEffect(() => {

	}, [])

	return (
		<div className='d-flex flex-row'>
			<AddOption id={profile.id} text={friendText} />
			<ChatOption id={profile.id} text={chatText} />
			<PongOption id={profile.id} text={'Pong'} />
			<BlockOption id={profile.id} text={blockText} />
		</div>
	)
}

type optionProp = {
	id: number
	text: string
}

export function AddOption({id, text}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='addOption' />
			<p style={{ color: '#be2693' }}>{text}</p>
		</div>
	)
}

export function BlockOption({id, text}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='blockOption' />
			<p style={{ color: '#be2693' }}>{text}</p>
		</div>
	)
}

export function ChatOption({id, text}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='chatOption' />
			<p style={{ color: '#be2693' }}>{text}</p>
		</div>
	)
}

export function PongOption({id, text}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='pongOption'/>
			<p style={{ color: '#be2693'}}>{text}</p>
		</div>
	)
}