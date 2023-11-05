import { FidgetSpinner } from "react-loader-spinner";
import { Card, Container, Modal } from "react-bootstrap";
import { gamesSocket } from '../../utils/socket';
import { PaddleWheel } from "./PaddleWheel";
import { GraphicEffectsSettingsCard } from "./GraphicEffectsSettingsCard";
import { RulesModal } from "./RulesModal";
import { GameStatus } from "../../pages/GamePage";
import { useState, useEffect } from "react";

export const WebcamConfirmModal = ({ confirmAction, cancelAction }: { confirmAction: (e: any) => void, cancelAction: (e: any) => void }) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	// useEffect(() => {
	// 	if (showProps) {
	// 		handleShow();
	// 		console.log(showProps);
	// 	}
	// }, [showProps]);

	return (
		<>
			<button id="webcamButton" className="btn btn-secondary" onClick={handleShow}>Play using webcam !</button>
			<Modal size="sm"
				aria-labelledby="contained-modal-title-vcenter"
				centered show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title className="text-black">B</Modal.Title>
				</Modal.Header>
				<Modal.Body className="text-black">
					C
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-primary" onClick={(e: any) => { handleClose(); confirmAction(e); }}>
						Yes !
					</button>
					<button className="btn btn-danger" onClick={(e: any) => { handleClose(); cancelAction(e); }}>
						Cancel
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
};


type GameWaitingRoomProps = {
	gameStatus: GameStatus;
	startMatchmaking: () => void;
	cancelOrLeave: () => void;
	paddleColor: string;
	graphicEffectsSettings: boolean;
	playUsingWebcam: (e: any) => void;
	cancelCamera: () => void;
};

export const GameWaitingRoom = ({ gameStatus, startMatchmaking, cancelOrLeave, paddleColor, graphicEffectsSettings, playUsingWebcam, cancelCamera }: GameWaitingRoomProps) => {
	return (
		<div className="d-flex align-items-center justify-content-center h-100">
			<Card border="none" text="white" className="w-75 p-3 border-0" style={{ background: "transparent" }}>
				<Card.Body className="text-center">
					{gameStatus === GameStatus.Idle && <>
						<Card.Title>Player vs player</Card.Title>
						<Card.Text>
							You are about to play a game against another player. Get ready to compete and have fun!
						</Card.Text>
						<br></br>
						<Container className="d-flex justify-content-center gap-3">
							<button onClick={startMatchmaking} disabled={!gamesSocket.connected} className="btn btn-primary"><b>Play</b></button>
							{/* <button id="webcamButton" className="btn btn-secondary" onClick={playUsingWebcam}>Play using webcam !</button> */}
							<RulesModal />
							<WebcamConfirmModal confirmAction={playUsingWebcam} cancelAction={cancelCamera} />
						</Container>
						<PaddleWheel currentColor={paddleColor} />
						<GraphicEffectsSettingsCard currentSettings={graphicEffectsSettings} />
					</>}
					{gameStatus === GameStatus.Matching && <MatchingScreen cancelOrLeave={cancelOrLeave} />}
					{gameStatus === GameStatus.Loading && <LoadingScreen cancelCamera={cancelCamera} />}
				</Card.Body>
			</Card>
		</div>
	);
};

const LoadingScreen = ({ cancelCamera }: { cancelCamera: () => void }) => {
	return (
		<>
			<Card.Title>Loading</Card.Title>
			<Card.Text>
				Loading camera, please wait ! It can take up to 1min...
			</Card.Text>
			<FidgetSpinner
				visible={gamesSocket.connected}
				height="80"
				width="80"
				ariaLabel="dna-loading"
				wrapperStyle={{}}
				wrapperClass="dna-wrapper"
				ballColors={['#ff0000', '#00ff00', '#0000ff']}
				backgroundColor="#F4442E" />
			<br></br>
			<br></br>
			<button onClick={cancelCamera} className="btn btn-primary"><b>Cancel</b></button>
		</>
	);
}

const MatchingScreen = ({ cancelOrLeave }: { cancelOrLeave: () => void }) => {
	return <>
		<Card.Title>Matchmaking in progress</Card.Title>
		<Card.Text>
			Looking for another player
		</Card.Text>
		<FidgetSpinner
			visible={gamesSocket.connected}
			height="80"
			width="80"
			ariaLabel="dna-loading"
			wrapperStyle={{}}
			wrapperClass="dna-wrapper"
			ballColors={['#ff0000', '#00ff00', '#0000ff']}
			backgroundColor="#F4442E" />
		<br></br>
		<br></br>
		<button onClick={cancelOrLeave} className="btn btn-primary"><b>Cancel</b></button>
	</>;
}

