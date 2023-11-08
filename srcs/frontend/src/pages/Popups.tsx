import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglass } from '@fortawesome/free-solid-svg-icons';
import { redirect, useNavigate } from "react-router-dom";
import { gamesSocket } from "../utils/socket";
import { enqueueSnackbar } from "notistack";


type popupProp = {
	nick: string,
	popupId: string,
	setPopup: React.Dispatch<React.SetStateAction<"no" | "pong" | "ponged">>
}

export function PongedPopup({ nick, setPopup, popupId }: popupProp) {
	const [id, setId] = useState<NodeJS.Timeout>();
	const navigate = useNavigate();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			// emit event 
			setPopup('no')
		}, 30000);
		setId(timeoutId);
		gamesSocket.on('cancelledMatchmake', () => {
			clearTimeout(id);
			setPopup('no');
			enqueueSnackbar('Match cancelled', { variant: 'info' });
		})
	}, [])

	const onAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		// emit event
		clearTimeout(id);
		setPopup('no')
		navigate(`/`, { state: { gameUserId: popupId }, replace: true });
	}

	const onDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		gamesSocket.emit('cancelMatchmake', popupId);
		// emit event
		clearTimeout(id);
		setPopup('no')
	}

	return (
		<div className='screen-mask'>
			<div className='popup'>
				<FontAwesomeIcon icon={faHourglass} spinPulse size="2xl" style={{ color: "#fa34c3", }} />
				<p className='mt-5'>{nick} sent you a challenge</p>
				<button className='btn btn-primary my-2'
					onClick={(e) => onAccept(e)}>
					PONG!
				</button>
				<button className='btn btn-outline-primary'
					onClick={(e) => onDecline(e)}>
					Chill
				</button>
			</div>
		</div>
	)
}

export function PongPopup({ nick, setPopup }: popupProp) {
	const [id, setId] = useState<NodeJS.Timeout>();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			// emit event 
			setPopup('no')
		}, 30000);

		setId(timeoutId);
	}, [])

	const onCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		clearTimeout(id);
		// emit event
		setPopup('no');
	}

	return (
		<div className='screen-mask'>
			<div className='popup'>
				<FontAwesomeIcon icon={faHourglass} spinPulse size="2xl" style={{ color: "#fa34c3", }} />
				<p className='mt-5'>Waiting response from {nick} ... </p>
				<button className='btn btn-primary my-2'
					onClick={(e) => onCancel(e)}>
					Cancel
				</button>
			</div>
		</div>
	)
}

