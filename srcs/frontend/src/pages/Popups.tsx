import { useEffect } from "react";

type popupProp = {
	nick: string,
	setPopup: React.Dispatch<React.SetStateAction<"no" | "pong" | "ponged">>
}

export function PongedPopup({nick, setPopup}: popupProp) {
		
	useEffect(() => {
		setTimeout(() => { setPopup('no') }, 30000);
	}, [])
	
	const onAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		// emit event
		// close window
		setPopup('no')
	}
	
	const onDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		// emit event
		// close window
		setPopup('no')
	}
	
	return (
		<div className='screen-mask'>
			<div className='popup'>
				<p>Accept the challenge sent from {nick} ? </p>
				<button className='btn btn-primary my-2' 
					onClick={(e) => onAccept(e)}>
					Pong!
				</button>
				<button className='btn btn-outline-primary'
					onClick={(e) => onDecline(e)}>
					Probably No
				</button>
			</div>
		</div>
	)
}

export function PongPopup({ nick, setPopup }: popupProp) {
	
	useEffect(() => {
		setTimeout(() => { setPopup('no') }, 30000);
	}, [])
	
	return (
		<div className='screen-mask'>
			<div className='popup'>
				<p>Waiting response from {nick} ... </p>
			</div>
		</div>
	)
}

