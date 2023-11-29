/**
 * @component GamePage
 * @description The main component for the game page, which includes the game canvas and logic for gameplay.
 * @filesource /home/antoine/ft_transcendence/srcs/frontend/src/pages/GamePage.tsx
 * @requires react, react-router-dom, @react-three/fiber, @react-three/drei, three, ../utils/socket, ../assets/game/pongMapRounded.png, ../components/game/Timer, ../components/game/CameraFOVHandler, ../components/game/GameSummaryModal, ../components/game/GameWaitingRoom, ../components/game/UserWrapper, ../components/game/BallWrapper, ../components/game/CanvasGraphicEffects
 * @exports default
 * @enum {string} GameStatus - Enum for the different game statuses.
 * @property {string} Idle - The game is idle.
 * @property {string} Matching - The game is currently matching players.
 * @property {string} Started - The game has started.
 * @property {string} Finished - The game has finished.
 * @property {string} Loading - The game is currently loading.
 */
import * as THREE from "three"
import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { Plane, ShakeController } from "@react-three/drei"
import { gamesSocket, socket as globalSocket } from '../utils/socket';
import { useLocation } from "react-router-dom"
import { WebcamPong } from "../components/game/WebcamPong"
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import pongMapTexture from '../assets/game/pongMapRounded.png'
import { Timer } from "../components/game/Timer"
import { CameraFOVHandler } from "../components/game/CameraFOVHandler"
import { GameSummaryModal } from "../components/game/GameSummaryModal"
import { GameWaitingRoom } from "../components/game/GameWaitingRoom"
import { UserWrapper } from "../components/game/UserWrapper";
import { BallWrapper } from "../components/game/BallWrapper";
import { CanvasGraphicEffects } from "../components/game/CanvasGraphicEffects";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from 'react-router-dom';

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
	const [opponent, setOpponent] = useState<any>(null);

	const navigate = useNavigate();


	let indexTime = 0;


	const changeHandPos = (pos: number = -1) => {
		handPos.current = pos
	}
	const onMessageStartGame = (_newId: any) => {
		gamesSocket.emit('getMyGameSettings', (res: any) => {
			setPaddleColor(res.paddleColor);
			setGraphicEffects(res.graphicEffects);
		});
		setGameStatus(GameStatus.Started);
	};
	const onMessageClients = (newClients: any) => {
		setClients(newClients.clients);
		setTime(newClients.time);
		if (newClients.ball) {
			setBall(newClients.ball);
		}


		if (clients && cameraShakeRef.current) {
			for (const client of Object.values(newClients.clients) as any) {
				if (client.scoredThisUpdate) {
					cameraShakeRef.current.setIntensity(1);
					break;
				}
			}
		}
		if (handPos.current === -1) return;
		for (const client of Object.keys(newClients.clients)) {
			if (client == id.current) {
				const pos = 100 - handPos.current * 100;
				const currentPos = newClients.clients[id.current.toString()].y;
				if (indexTime++ % 5 !== 0) return;
				if (Math.abs(pos - currentPos) > 3) {
					if (pos < currentPos) {
						sendPressed("down", true);
						sendPressed("up", false);
					} else if (pos > currentPos) {
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

	};
	const onMessageGameOver = (summary: any) => {
		setSummary(summary);
		setGameStatus(GameStatus.Idle);
		setWebcam(false);
	};
	const onCancelledMatchmake = (data: { reason?: string } | undefined) => {
		if (data?.reason === undefined) {
			enqueueSnackbar(`Match cancelled`, { variant: 'info', autoHideDuration: 4000 })
		} else {
			enqueueSnackbar(`Match cancelled, ${data?.reason}`, { variant: 'info', autoHideDuration: 4000 })
		}
		setGameStatus(GameStatus.Idle);
		setWebcam(false);
	};
	const subscribeToGamesSocketMessages = () => {
		gamesSocket.on('startGame', onMessageStartGame);
		gamesSocket.on('clients', onMessageClients)
		gamesSocket.on('gameOver', onMessageGameOver)
		gamesSocket.on('cancelledMatchmake', onCancelledMatchmake)
	}
	const unsubscribeToGamesSocketMessages = () => {
		gamesSocket.off('startGame', onMessageStartGame);
		gamesSocket.off('clients', onMessageClients)
		gamesSocket.off('gameOver', onMessageGameOver)
		gamesSocket.off('cancelledMatchmake', onCancelledMatchmake)
	}
	const sendPressed = (key: string, pressed: boolean) => {
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
	const cancelOrLeave = () => {
		playUsingWebcam('cancel')
		gamesSocket.emit('cancel');
		setGameStatus(GameStatus.Idle);
		if (opponent) {
			gamesSocket.emit('cancel');
		}
	};
	const onWebcamFinishedLoading = () => {
		if (gameStatus === GameStatus.Loading)
			startMatchmaking();
	}

	const playUsingWebcam = (e: any) => {
		if (webcam || e === 'cancel') {
			setWebcam(false);
			setGameStatus(GameStatus.Idle);
			return
		}
		setWebcam(true);
		setGameStatus(GameStatus.Loading);
	}

	useEffect(() => {
		subscribeToGamesSocketMessages();
		gamesSocket.emit('getMyGameSettings', (res: any) => {
			setPaddleColor(res.paddleColor);
			setGraphicEffects(res.graphicEffects);
		});
		return () => {
			cancelOrLeave();
			unsubscribeToGamesSocketMessages();
		}
	}, [])

	useEffect(() => {
		const firstConnexion = localStorage.getItem('firstConnexion') || null;
		if (firstConnexion === 'true') {
			localStorage.setItem('firstConnexion', 'false');
			enqueueSnackbar("You can update your avatar and your username anytime here !", { variant: 'info', persist: false });
			navigate('/me');
		}
	}, [])

	useEffect(() => {
		const gameUserId = location.state?.gameUserId
		globalSocket.emit('MyProfile', (res: any) => {
			id.current = res.id;
			if (gameUserId && gameUserId != res.id) {
				gamesSocket.emit('matchAgainst', { id: gameUserId });
				if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
				setOpponent(gameUserId)
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

	const onWebcamError = () => {
		setWebcam(false);
		setGameStatus(GameStatus.Idle);
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WebcamPong changeHandPos={changeHandPos} webcam={webcam} onWebcamFinishedLoading={onWebcamFinishedLoading} onError={onWebcamError} />
			<GameSummaryModal summary={summary} />
			{/* <WebcamConfirmModal showProps={webcamConfirmModalOpen} confirmAction={enableCam} /> */}

			{gameStatus !== GameStatus.Started ?
				<GameWaitingRoom
					startMatchmaking={startMatchmaking}
					cancelOrLeave={cancelOrLeave}
					paddleColor={paddleColor}
					gameStatus={gameStatus}
					graphicEffectsSettings={graphicEffects}
					playUsingWebcam={playUsingWebcam}
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
								const { y, dir, score } = clients[client]
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
						{clients[id.current] !== undefined && <BallWrapper ball={ball} client={clients[id.current]} graphicEffects={graphicEffects} />}
						<Plane receiveShadow args={[200, 100]} position={[0, 50, -3]} material={new THREE.MeshStandardMaterial({ map: pongMap, emissiveMap: pongMap, emissive: 'white', emissiveIntensity: .7, toneMapped: false })} />
					</group >
					{graphicEffects && <CanvasGraphicEffects cameraShakeRef={cameraShakeRef} />}
				</Canvas >
			}
		</Suspense>
	)
}


