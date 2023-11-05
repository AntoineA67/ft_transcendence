import * as THREE from "three"
import { useEffect, useRef, useState } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { Plane, ShakeController } from "@react-three/drei"
import { gamesSocket, socket as globalSocket } from '../utils/socket';
import { useLocation } from "react-router-dom"
import { WebcamPong } from "./WebcamPong"
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import pongMapTexture from '../assets/game/pongMapRounded.png'
import { Timer } from "../components/game/Timer"
import { CameraFOVHandler } from "../components/game/CameraFOVHandler"
import { GameSummaryModal } from "../components/game/GameSummaryModal"
import { GameWaitingRoom } from "../components/game/GameWaitingRoom"
import { UserWrapper } from "../components/game/UserWrapper";
import { BallWrapper } from "../components/game/BallWrapper";
import { CanvasGraphicEffects } from "../components/game/CanvasGraphicEffects";

export enum GameStatus {
	Idle = 'idle',
	Matching = 'matching',
	Started = 'started',
	Finished = 'finished',
	Loading = 'loading',
}

export default function GamePage() {

	const [clients, setClients] = useState({} as any)
	const id = useRef<string>('')
	const [ball, setBall] = useState({} as any)
	const [time, setTime] = useState(0);
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle)
	const [paddleColor, setPaddleColor] = useState('#fff');
	const handPos = useRef<number>(-1)
	const pongMap = useLoader(TextureLoader, pongMapTexture)
	const cameraShakeRef = useRef<ShakeController>()
	const [graphicEffects, setGraphicEffects] = useState<boolean>(false);
	const [summary, setSummary] = useState<any>(null);
	const location = useLocation();
	const [webcam, setWebcam] = useState<boolean>(false);
	const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
	let indexTime = 0;


	const changeHandPos = (pos: number = -1) => {
		handPos.current = pos
	}
	const subscribeToGamesSocketMessages = (action: 'on' | 'off') => {
		const gameSocketAction = action === 'on' ? gamesSocket.on : gamesSocket.off
		gameSocketAction('startGame', (_newId: any) => {
			gamesSocket.emit('getMyGameSettings', (res: any) => {
				setPaddleColor(res.paddleColor);
				setGraphicEffects(res.graphicEffects);
			});
			setGameStatus(GameStatus.Started);
		});
		gameSocketAction('clients', (newClients: any) => {
			setClients(newClients.clients)
			setTime(newClients.time);
			if (newClients.ball) {
				setBall(newClients.ball)
			}


			if (clients && cameraShakeRef.current) {
				for (const client of Object.values(newClients.clients) as any) {
					if (client.scoredThisUpdate) {
						cameraShakeRef.current.setIntensity(1);
						break;
					}
				}
			}
			if (handPos.current === -1) return
			for (const client of Object.keys(newClients.clients)) {
				if (client == id.current) {
					const pos = 100 - handPos.current * 100;
					console.log("changeHandPos", pos, client === id.current.toString(), typeof id.current, newClients.clients[id.current.toString()])
					const currentPos = newClients.clients[id.current.toString()].y;
					if (indexTime++ % 10 !== 0) return
					if (Math.abs(pos - currentPos) > 5) {
						if (pos < currentPos) {
							// console.log("Going up !")
							sendPressed("down", true);
							sendPressed("up", false);
						} else if (pos > currentPos) {
							// console.log("Going down !")
							sendPressed("up", true);
							sendPressed("down", false);
						}
					} else {
						sendPressed("up", false);
						sendPressed("down", false);
					}
					indexTime = 0;
					break;
				}
			}

		})
		gameSocketAction('gameOver', (summary: any) => {
			// console.log('Game Over! Winner: ', winner);
			setSummary(summary);
			setGameStatus(GameStatus.Idle);
			setWebcam(false);
			setWebcamRunning(false);
			// setGameStatus(GameStatus.Finished);
		})
	}
	const sendPressed = (key: string, pressed: boolean) => {
		console.log("sendPressed", key, pressed)
		keysPressed.current[key] = pressed
		keysPressed.current.time = Date.now()
		gamesSocket.emit("keyPresses", keysPressed.current);
	}
	const onkeydown = (event: KeyboardEvent) => {
		if (event.repeat) return
		if (event.key === "ArrowUp" || event.key === "w") { sendPressed("up", true) }
		if (event.key === "ArrowDown" || event.key === "s") { sendPressed("down", true) }
	}
	const onkeyup = (event: KeyboardEvent) => {
		if (event.key === "ArrowUp" || event.key === "w") { sendPressed("up", false) }
		if (event.key === "ArrowDown" || event.key === "s") { sendPressed("down", false) }
	}
	const startMatchmaking = () => {
		if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
		setClients({})
		setBall({})
		setTime(0);
		sendPressed("up", false)
		sendPressed("down", false)
		setSummary(null);
		gamesSocket.emit('match');
		setGameStatus(GameStatus.Matching);
	};
	const cancelMatchmaking = () => {
		gamesSocket.emit('cancel');
		setGameStatus(GameStatus.Idle);
	};
	const onWebcamFinishedLoading = () => {
		console.log("loadeddata")
		setWebcamRunning(true);
		startMatchmaking();
	}

	const playUsingWebcam = (e: any) => {
		if (webcam || e === 'cancel') {
			setWebcamRunning(false);
			setWebcam(false);
			setGameStatus(GameStatus.Idle);
			return
		}
		setWebcam(true);
		// const video = document.getElementById("webcam") as any;
		// video.addEventListener("loadeddata", () => {
		// 	console.log("loadeddata")
		// 	setWebcamRunning(true);
		// 	startMatchmaking();
		// });
		setGameStatus(GameStatus.Loading);
	}

	useEffect(() => {
		subscribeToGamesSocketMessages('on');
		gamesSocket.emit('getMyGameSettings', (res: any) => {
			setPaddleColor(res.paddleColor);
			setGraphicEffects(res.graphicEffects);
		});
		return () => {
			// console.log("Game unmounted");
			cancelMatchmaking();
			subscribeToGamesSocketMessages('off');
		}
	}, [gamesSocket])

	useEffect(() => {
		const gameUserId = location.state?.gameUserId
		globalSocket.emit('MyProfile', (res: any) => {
			id.current = res.id;
			if (gameUserId && gameUserId != res.id) {
				gamesSocket.emit('matchAgainst', gameUserId);
				if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
				setGameStatus(GameStatus.Matching);
				window.history.replaceState({}, document.title)
			}
		});
	}, [location])

	useEffect(() => {
		if (gameStatus === GameStatus.Started) {
			window.addEventListener('keydown', onkeydown);
			window.addEventListener('keyup', onkeyup);
			return () => {
				window.removeEventListener('keydown', onkeydown);
				window.removeEventListener('keyup', onkeyup);
			};
		}
	}, [gameStatus])

	return (
		<>
			<WebcamPong changeHandPos={changeHandPos} webcam={webcam} onWebcamFinishedLoading={onWebcamFinishedLoading} />
			<GameSummaryModal summary={summary} />

			{gameStatus !== GameStatus.Started ?
				<GameWaitingRoom
					startMatchmaking={startMatchmaking}
					cancelMatchmaking={cancelMatchmaking}
					paddleColor={paddleColor}
					gameStatus={gameStatus}
					graphicEffectsSettings={graphicEffects}
					playUsingWebcam={playUsingWebcam}
					cancelCamera={() => playUsingWebcam('cancel')}
				/>
				:
				<Canvas style={{ background: "black" }} id="game-canvas" camera={{ isOrthographicCamera: true, rotation: [.005, 0, 0], position: [0, 50, 200], fov: 60, near: 60, far: 250 }}
					dpr={1}
					gl={{
						powerPreference: "high-performance",
						antialias: false,
						stencil: false,
						depth: false,
					}}>
					<CameraFOVHandler />
					<pointLight color={'#f0f0f0'} position={[100, 100, 25]} intensity={1.5} />
					<ambientLight intensity={0.5} />
					<group position-y={2}>
						<Timer time={time} />
						{Object.keys(clients)
							.map((client) => {
								const { y, dir, score, xDistance } = clients[client]
								const pos = [client == id.current ? -97.5 : 97.5, y, 0]
								const myPaddleColor = client == id.current ? paddleColor : '#fff';
								return (
									<UserWrapper
										key={client}
										id={client}
										score={score}
										position={pos}
										rotation={[0, dir, 0]}
										paddleColor={myPaddleColor}
									/>
								)
							})}
						{clients[id.current] !== undefined && < BallWrapper ball={ball} client={clients[id.current]} graphicEffects={graphicEffects} />}
						<Plane receiveShadow args={[200, 100]} position={[0, 50, -3]} material={new THREE.MeshStandardMaterial({ map: pongMap, emissiveMap: pongMap, emissive: 'white', emissiveIntensity: .7, toneMapped: false })} />
					</group >
					{graphicEffects && <CanvasGraphicEffects cameraShakeRef={cameraShakeRef} />}
				</Canvas >
			}
		</>
	)
}


