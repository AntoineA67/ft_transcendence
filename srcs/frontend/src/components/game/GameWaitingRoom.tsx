import { FidgetSpinner } from "react-loader-spinner";
import { Card, Container } from "react-bootstrap";
import { gamesSocket } from '../../utils/socket';
import { PaddleWheel } from "./PaddleWheel";
import { GraphicEffectsSettingsCard } from "./GraphicEffectsSettingsCard";
import { RulesModal } from "./RulesModal";
import { GameStatus } from "../../pages/GamePage";

type GameWaitingRoomProps = {
	gameStatus: GameStatus;
	startMatchmaking: () => void;
	cancelMatchmaking: () => void;
	paddleColor: string;
	graphicEffectsSettings: boolean;
	playUsingWebcam: (e: any) => void;
	cancelCamera: () => void;
};
export const GameWaitingRoom = ({ gameStatus, startMatchmaking, cancelMatchmaking, paddleColor, graphicEffectsSettings, playUsingWebcam, cancelCamera }: GameWaitingRoomProps) => {
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
						</Container>
						<PaddleWheel currentColor={paddleColor} />
						<GraphicEffectsSettingsCard currentSettings={graphicEffectsSettings} />
					</>}
					{gameStatus === GameStatus.Matching && <>
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
						<button onClick={cancelMatchmaking} className="btn btn-primary"><b>Cancel</b></button>
					</>}
					{gameStatus === GameStatus.Loading && <>
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
					</>}
				</Card.Body>
			</Card>
		</div>
	);
};
