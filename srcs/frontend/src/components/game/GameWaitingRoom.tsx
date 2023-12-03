import { FidgetSpinner } from "react-loader-spinner";
import { Card, Container } from "react-bootstrap";
import { gamesSocket } from '../../utils/socket';
import { PaddleWheel } from "./PaddleWheel";
import { GraphicEffectsSettingsCard } from "./GraphicEffectsSettingsCard";
import { RulesModal } from "./RulesModal";
import { GameStatus } from "../../pages/GamePage";
import { WebcamConfirmModal } from "./WebcamConfirmModal";

type GameWaitingRoomProps = {
	gameStatus: GameStatus;
	startMatchmaking: () => void;
	cancelOrLeave: () => void;
	paddleColor: string;
	graphicEffectsSettings: boolean;
	playUsingWebcam: (e: any) => void;
};



export const GameWaitingRoom = ({ gameStatus, startMatchmaking, cancelOrLeave, paddleColor, graphicEffectsSettings, playUsingWebcam }: GameWaitingRoomProps) => {
	return (
		<Card border="none" text="white" className="w-100 w-md-75 p-3 border-0" style={{ background: "transparent" }}>
			<Card.Body className="text-center">
				{gameStatus === GameStatus.Idle && <>
					<Card.Title>Player vs player</Card.Title>
					<Card.Text>
						You are about to play a game against another player. Get ready to compete and have fun!
					</Card.Text>
					<br></br>
					<Container className="d-flex flex-column flex-md-row justify-content-center gap-3">
						<button onClick={startMatchmaking} disabled={!gamesSocket.connected} className="btn btn-primary"><b>Play</b></button>
						<RulesModal />
						<WebcamConfirmModal confirmAction={playUsingWebcam} cancelAction={cancelOrLeave} />
					</Container>
					<PaddleWheel currentColor={paddleColor} />
					<GraphicEffectsSettingsCard currentSettings={graphicEffectsSettings} />
				</>}
				{gameStatus === GameStatus.Matching && <MatchingScreen cancelOrLeave={cancelOrLeave} />}
				{gameStatus === GameStatus.Loading && <LoadingScreen cancelCamera={cancelOrLeave} />}
			</Card.Body>
		</Card>
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
