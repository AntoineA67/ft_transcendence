import { profileType } from "../../types/user";
import { useState } from "react";

type OptionsProp = {
	profile: profileType
}
export function Options({ profile }: OptionsProp) {
	const [friendText] = useState<'Add' | 'Sent' | 'Friend!'>()
	const [BlockText] = useState<'Block' | 'Unblock'>(profile.block ? 'Block' : 'Unblock');

	return (
		<div className='d-flex flex-row'>
			<AddOption id={profile.id}/>
			<ChatOption id={profile.id}/>
			<PongOption id={profile.id}/>
			<BlockOption id={profile.id}/>
		</div>
	)
}

type optionProp = {
	id: number
}

export function AddOption({id}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='addOption' />
			<p style={{ color: '#be2693' }}>Add</p>
		</div>
	)
}

export function BlockOption({id}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='blockOption' />
			<p style={{ color: '#be2693' }}>Block</p>
		</div>
	)
}

export function ChatOption({id}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='chatOption' />
			<p style={{ color: '#be2693' }}>Chat</p>
		</div>
	)
}

export function PongOption({id}: optionProp) {
	return (
		<div className='d-flex flex-column align-items-center'>
			<button className='pongOption'/>
			<p style={{ color: '#be2693'}}>Pong</p>
		</div>
	)
}