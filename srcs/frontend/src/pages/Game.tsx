import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useLoader, useThree } from "@react-three/fiber"
import { Box, CameraShake, ContactShadows, Plane, SoftShadows, Text } from "@react-three/drei"
import { FidgetSpinner } from "react-loader-spinner"
import { Card } from "react-bootstrap"
import { gamesSocket, socket as globalSocket } from '../utils/socket';
import { Wheel } from '@uiw/react-color';
import { useParams } from "react-router-dom"
import { WebcamPong } from "./WebcamPong"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import pongMapTexture from '../assets/game/pongMapRounded.png'


const BallWrapper = ({ ball, client, graphicEffects }: any) => {
	const ballClientPosition: THREE.Vector3 = useMemo(() => {
		const invertedX = client.invertedSide ? ball.x * -1 : ball.x;
		return new THREE.Vector3(invertedX, ball.y, 0);
	}, [ball, client]);
	const ballMaterial = useRef<THREE.Material>()

	useEffect(() => {
		ballMaterial.current = new THREE.MeshBasicMaterial();
	}, [])
	return (
		<>
			<Box position={ballClientPosition} />
			<mesh
				position={ballClientPosition}
				geometry={new THREE.BoxGeometry(2, 2, 2)}
				material={graphicEffects ? new THREE.MeshStandardMaterial({ color: [3, 3, 3] as any, toneMapped: false }) : new THREE.MeshBasicMaterial()}
			// material={ballMaterial.current}
			>
				{/* {graphicEffects ? <meshStandardMaterial color={[2, 2, 2]} toneMapped={false} />
					:
				} */}
				{/* <meshBasicMaterial toneMapped={false} color={'white'} /> */}
				{/* <meshStandardMaterial color={[2, 2, 2]} toneMapped={false} /> */}
			</mesh>
		</>
	)
}

const UserWrapper = ({ position, rotation, id, score, paddleColor }: any) => {
	// const baseNeon = useRef<any>()
	useEffect(() => {
		// if (baseNeon.current === undefined) return
		// baseNeon.current.material.color.r = 10
		console.log(paddleColor)
	}, [])
	return (
		<>
			<Text
				position={[position[0] > 0 ? position[0] + 20 : position[0] - 20, 50, 0]}
				color="white"
				anchorX="center"
				anchorY="middle"
				scale={[20, 20, 20]}
			>
				{score}
			</Text>
			{/* <Box position={position} /> */}
			<mesh
				position={position}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry(5, 20, 2)}
				material={new THREE.MeshStandardMaterial({ color: paddleColor, emissive: paddleColor, emissiveIntensity: 3, toneMapped: false })}
			// ref={baseNeon}
			// material={new THREE.MeshStandardMaterial({ color: paddleColor })}
			>
			</mesh >
		</>
	)
}

const Timer = ({ time }: any) => {
	const minutes = Math.floor(time / 60 / 1000);
	const seconds = Math.floor(time / 1000 % 60);
	return (
		<>
			<Text
				position={[0, 130, 10]}
				color="white"
				anchorX="center"
				anchorY="middle"
				scale={[20, 20, 20]}
			>
				{minutes}:{seconds.toString().padStart(2, '0')}
			</Text>
		</>
	)
}

const PaddleWheel = ({ currentColor }: any) => {
	const [hex, setHex] = useState("#fff");

	useEffect(() => {
		setHex(currentColor);
	}, [currentColor]);
	return (
		<Card className="paddle-wheel-card m-5" style={{ maxWidth: "140px" }}>
			<Card.Header>Paddle Color</Card.Header>
			<Card.Body className="flex align-center">
				<Wheel
					style={{ minHeight: "20px" }}
					color={hex}
					width={100}
					height={100}
					onChange={(color) => {
						gamesSocket.emit('changeColor', color.hex);
						setHex(color.hex);
					}}
				/>
			</Card.Body>
		</Card>
	);
}

const GraphicEffectsSettings = ({ currentSettings }: any) => {
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		setChecked(currentSettings);
	}, [currentSettings]);

	return (
		<Card className="paddle-wheel-card m-5" style={{ maxWidth: "140px" }}>
			<Card.Header>Graphic Effects</Card.Header>
			<Card.Body className="flex align-center">
				<input type="checkbox"
					checked={checked}
					onChange={(e: any) => {
						gamesSocket.emit('setGraphicEffects', e.target.checked);
						setChecked(e.target.checked);
					}}
				/>
			</Card.Body>
		</Card>
	);
}

enum GameStatus {
	Idle = 'idle',
	Matching = 'matching',
	Started = 'started',
	Finished = 'finished',
}

const CameraFOVHandler = () => {
	const { camera, gl } = useThree() as any

	const onWindowResize = () => {

		camera.aspect = window.innerWidth / window.innerHeight;
		let newFov = (2000 / window.innerWidth) * 30 + (window.innerWidth * .015)
		if (window.innerWidth < 400) {
			newFov = 120
		} else if (window.innerWidth < 600) {
			newFov = 105
		} else if (window.innerWidth < 800) {
			newFov = 80
		} else if (window.innerWidth < 1600) {
			newFov = 70
		} else {
			newFov = 60
		}
		camera.fov = newFov
		camera.updateProjectionMatrix();
		gl.setSize(window.innerWidth, window.innerHeight);
	}
	useEffect(() => {
		onWindowResize()
		window.addEventListener('resize', onWindowResize, false);
		return () => {
			window.removeEventListener('resize', onWindowResize, false);
		}
	}, [])

	return (
		<></>
	)
}

type GameWaitingRoomProps = {
	gameStatus: GameStatus,
	startMatchmaking: () => void,
	cancelMatchmaking: () => void,
	paddleColor: string,
	graphicEffectsSettings: boolean,
};

const GameWaitingRoom = ({ gameStatus, startMatchmaking, cancelMatchmaking, paddleColor, graphicEffectsSettings }: GameWaitingRoomProps) => {
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
						<button onClick={startMatchmaking} disabled={!gamesSocket.connected} className="btn btn-primary"><b>Play</b></button>
						<PaddleWheel currentColor={paddleColor} />
						<GraphicEffectsSettings currentSettings={graphicEffectsSettings} />
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
							backgroundColor="#F4442E"
						/>
						<br></br>
						<br></br>
						<button onClick={cancelMatchmaking} className="btn btn-primary"><b>Cancel</b></button>
					</>}
					{gameStatus === GameStatus.Finished && <>
						<Card.Title>Game over !</Card.Title>
						<Card.Text>
							You lost or maybe you won, who knows...
						</Card.Text>
						<br></br>
						<button onClick={startMatchmaking} className="btn btn-primary"><b>Replay</b></button>
					</>}
				</Card.Body>
			</Card>
		</div>
	)
}

export default function Game() {

	const [clients, setClients] = useState({} as any)
	const id = useRef<string>('')
	const [ball, setBall] = useState({} as any)
	const [time, setTime] = useState(0);
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle)
	const [paddleColor, setPaddleColor] = useState('#fff');
	const handPos = useRef<number>(-1)
	let params = useParams();
	const pongMap = useLoader(TextureLoader, pongMapTexture)
	const cameraShakeRef = useRef<any>()
	const [graphicEffects, setGraphicEffects] = useState<boolean>(false);


	const changeHandPos = (pos: number = -1) => {
		handPos.current = pos
	}

	useEffect(() => {
		globalSocket.emit('MyProfile', (res: any) => {
			console.log("MyProfile", res);
			id.current = res.id;
			if (params.userId && params.userId != res.id) {
				console.log("Matching against", params.userId);
				gamesSocket.emit('matchAgainst', params.userId);
				if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
				setGameStatus(GameStatus.Matching);
			}
		});
		gamesSocket.emit('getMyGameSettings', (res: any) => {
			console.log(res)
			setPaddleColor(res.paddleColor);
			setGraphicEffects(res.graphicEffects);
		});
		gamesSocket.on('startGame', (newId: any) => {
			gamesSocket.emit('getMyGameSettings', (res: any) => {
				console.log("MyColor", res.paddleColor);
				setPaddleColor(res.paddleColor);
				setGraphicEffects(res.graphicEffects);
			});
			console.log('startGame: ', newId)
			setGameStatus(GameStatus.Started);
			console.log('Game Started!')
		})

		let indexTime = 0;
		gamesSocket.on('clients', (newClients: any) => {
			if (clients && cameraShakeRef.current) {
				for (const client of Object.values(newClients.clients) as any) {
					if (client.scoredThisUpdate) {
						cameraShakeRef.current.setIntensity(1);
						break;
					}
				}
			}
			setClients(newClients.clients)
			setTime(newClients.time);
			if (newClients.ball) {
				setBall(newClients.ball)
			}

			if (handPos.current === -1) return
			for (const client of Object.keys(newClients.clients)) {
				if (client == id.current) {
					const pos = 100 - handPos.current * 100;
					// console.log("changeHandPos", pos, client === id.current.toString(), typeof id.current, newClients.clients[id.current.toString()])
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
		gamesSocket.on('gameOver', (winner: any) => {
			console.log('Game Over! Winner: ', winner);
			setGameStatus(GameStatus.Finished);
		})
		return () => {
			cancelMatchmaking();
			console.log("Game unmounted");
		}
	}, [gamesSocket])
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
	const startMatchmaking = () => {
		if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
		setClients({})
		setBall({})
		setTime(0);
		sendPressed("up", false)
		sendPressed("down", false)
		gamesSocket.emit('match');
		setGameStatus(GameStatus.Matching);
	};
	const cancelMatchmaking = () => {
		gamesSocket.emit('cancel');
		setGameStatus(GameStatus.Idle);
	};

	return (
		<>
			<WebcamPong changeHandPos={changeHandPos} />

			{gameStatus !== GameStatus.Started &&
				<GameWaitingRoom
					startMatchmaking={startMatchmaking}
					cancelMatchmaking={cancelMatchmaking}
					paddleColor={paddleColor}
					gameStatus={gameStatus}
					graphicEffectsSettings={graphicEffects} />
			}
			{gameStatus === GameStatus.Started &&
				<Canvas style={{ background: "black" }} id="game-canvas" camera={{ isOrthographicCamera: true, rotation: [.005, 0, 0], position: [0, 50, 200], fov: 60, near: 60, far: 250 }}
					dpr={1}
					gl={{
						powerPreference: "high-performance",
						antialias: false,
						stencil: false,
						depth: false,
					}}>
					<pointLight color={'#f0f0f0'} position={[100, 100, 25]} intensity={1.5} />
					<ambientLight intensity={0.5} />
					<CameraFOVHandler />
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
					{graphicEffects && <>
						<CameraShake
							maxYaw={0.01} // Max amount camera can yaw in either direction
							maxPitch={0.01} // Max amount camera can pitch in either direction
							maxRoll={0.01} // Max amount camera can roll in either direction
							yawFrequency={1} // Frequency of the the yaw rotation
							pitchFrequency={1} // Frequency of the pitch rotation
							rollFrequency={1} // Frequency of the roll rotation
							intensity={0} // initial intensity of the shake
							decayRate={.3}// if decay = true this is the rate at which intensity will reduce at
							decay={true}
							ref={cameraShakeRef}
						/>
						<EffectComposer multisampling={4} disableNormalPass>
							<Bloom luminanceThreshold={.5} intensity={0.3} levels={5} mipmapBlur />
							<Bloom luminanceThreshold={.5} intensity={0.1} levels={6} mipmapBlur />
						</EffectComposer>
					</>
					}
				</Canvas >
			}
		</>
	)
}