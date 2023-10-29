import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Box, Plane, Text } from "@react-three/drei"
import { FidgetSpinner } from "react-loader-spinner"
import { Card } from "react-bootstrap"
import { gamesSocket, socket as globalSocket } from '../utils/socket';
// import { Grid } from "@react-three/postprocessing"
import { Wheel } from '@uiw/react-color';
import { useParams } from "react-router-dom"
import { WebcamPong } from "./WebcamPong"


const BallWrapper = ({ ball, client }: any) => {
	const ballClientPosition: THREE.Vector3 = useMemo(() => {
		const invertedX = client.invertedSide ? ball.x * -1 : ball.x;
		return new THREE.Vector3(invertedX, ball.y, 0);
	}, [ball, client]);
	return (
		<>
			<Box position={ballClientPosition} />
			<mesh
				position={ballClientPosition}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry(2, 2, 2)}
				material={new THREE.MeshBasicMaterial()}
			>
			</mesh>
		</>
	)
}

const UserWrapper = ({ position, rotation, id, score, paddleColor }: any) => {
	return (
		<>
			<Box position={position} />
			<mesh
				position={position}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry(5, 20, 2)}
				material={new THREE.MeshBasicMaterial({ color: paddleColor })}
			>
				<Text
					position={[0, 20, 0]}
					color="white"
					anchorX="center"
					anchorY="middle"
					scale={[10, 10, 10]}
				>
					{score}
				</Text>
			</mesh>
		</>
	)
}

const Timer = ({ time }: any) => {
	const minutes = Math.floor(time / 60 / 1000);
	const seconds = Math.floor(time / 1000 % 60);
	return (
		<>
			<Text
				position={[0, 100, 10]}
				color="white"
				anchorX="center"
				anchorY="middle"
				scale={[10, 10, 10]}
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
		// <Wheel
		// 	style={{ marginLeft: 20 }}
		// 	color={hex}
		// 	onChange={(color) => {
		// 		gamesSocket.emit('changeColor', color.hex);
		// 		setHex(color.hex);
		// 	}}
		// />
	);
}

enum GameStatus {
	Idle = 'idle',
	Matching = 'matching',
	Started = 'started',
	Finished = 'finished',
}

export default function Game() {

	const [clients, setClients] = useState({} as any)
	// const [id, setId] = useState('' as any)
	const id = useRef<string>('')
	const [ball, setBall] = useState({} as any)
	const [time, setTime] = useState(0);
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle)
	const [paddleColor, setPaddleColor] = useState('#fff');
	// const [handPos, setHandPos] = useState(-1);
	const handPos = useRef<number>(-1)
	let params = useParams();

	const changeHandPos = (pos: number = -1) => {
		// console.log("changeHandPos", pos)
		// setHandPos(pos);
		handPos.current = pos

		// console.log("clients ??", clients, id, clients[id])
		// if (clients && clients[id.toString()]) {
		// 	const handPos = pos * 100;
		// 	const currentPos = clients[id.toString()].y;
		// 	console.log("changeHandPos", handPos, currentPos)
		// 	if (handPos > currentPos) {
		// 		sendPressed("down", true);
		// 		sendPressed("up", false);
		// 	} else if (handPos < currentPos) {
		// 		sendPressed("up", true);
		// 		sendPressed("down", false);
		// 	}
		// }


		// console.log("cant changeHandPos", pos, clients, id)
		// if (clients && clients.clients[id]) {
		// 	console.log("changeHandPos", pos)
		// 	const currentPos = clients.clients[id].y;
		// 	if (pos * 1000 > currentPos) {
		// 		sendPressed("down", true);
		// 		sendPressed("up", false);
		// 	} else if (pos * 1000 < currentPos) {
		// 		sendPressed("up", true);
		// 		sendPressed("down", false);
		// 	}
		// }
	}

	useEffect(() => {
		// const profile = axios.get('/profile', {
		// 	headers: {
		// 		Authorization: `Bearer ${localStorage.getItem('token')}`,
		// 	},
		// }).then((res: AxiosResponse) => res.data.json()).then((res) => {
		// 	setId(res.id);
		// });
		const profile = globalSocket.emit('MyProfile', (res: any) => {
			console.log("MyProfile", res);
			// setId(res.id);
			id.current = res.id;
		});
		const paddleColor = gamesSocket.emit('getMyPaddleColor', (res: any) => {
			console.log("MyColor", res.paddleColor);
			setPaddleColor(res.paddleColor);
		});
		// console.log("Id", id.current);
		// gamesSocket.on('connect', function () {
		// 	console.log('connect')
		// })
		// gamesSocket.on('disconnect', function (message: any) {
		// 	console.log('disconnect ' + message)
		// })

		// gamesSocket.on('id', (newId: any) => {
		// 	setId(newId)
		// })
		gamesSocket.on('startGame', (newId: any) => {
			const paddleColor = gamesSocket.emit('getMyPaddleColor', (res: any) => {
				console.log("MyColor", res.paddleColor);
				setPaddleColor(res.paddleColor);
			});
			console.log('startGame: ', newId)
			setGameStatus(GameStatus.Started);
			console.log('Game Started!')
		})

		let indexTime = 0;
		gamesSocket.on('clients', (newClients: any) => {
			setClients(newClients.clients)
			// console.log('clients: ', newClients.clients, newClients.ball, handPos.current)
			// clients.current = newClients.clients
			setTime(newClients.time);
			if (newClients.ball) {
				setBall(newClients.ball)
				// ball.current = newClients.ball
			}

			if (handPos.current === -1) return
			// if (Date.now() - keysPressed.current.time < 100) return
			for (const client of Object.keys(newClients.clients)) {
				// console.log(client, id.current)
				if (client == id.current) {
					const pos = 100 - handPos.current * 100;
					// console.log("changeHandPos", pos, client === id.current.toString(), typeof id.current, newClients.clients[id.current.toString()])
					const currentPos = newClients.clients[id.current.toString()].y;
					if (indexTime++ % 10 !== 0) return
					if (pos < currentPos) {
						// console.log("Going up !")
						sendPressed("down", true);
						sendPressed("up", false);
					} else if (pos > currentPos) {
						// console.log("Going down !")
						sendPressed("up", true);
						sendPressed("down", false);
					}
					console.log(pos, currentPos, keysPressed.current)
					indexTime = 0;
					break;
				}
			}

		})
		gamesSocket.on('gameOver', (winner: any) => {
			console.log('Game Over! Winner: ', winner);
			setGameStatus(GameStatus.Finished);
		})
		if (params.userId) {
			console.log("Matching against", params.userId);
			gamesSocket.emit('matchAgainst', params.userId);
			if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
			// gamesSocket.emit('match');
			setGameStatus(GameStatus.Matching);
		}
		return () => {
			cancelMatchmaking();
			console.log("Game unmounted");
		}
	}, [gamesSocket])
	const sendPressed = (key: string, pressed: boolean) => {
		keysPressed.current[key] = pressed
		keysPressed.current.time = Date.now()
		gamesSocket.emit("keyPresses", keysPressed.current);
		// console.log("sendPressed", keysPressed.current)
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
		gamesSocket.emit('match');
		setGameStatus(GameStatus.Matching);
	};
	const cancelMatchmaking = () => {
		// if (gameStatus !== GameStatus.Matching) return
		gamesSocket.emit('cancel');
		setGameStatus(GameStatus.Idle);
	};

	return (
		<>
			<WebcamPong changeHandPos={changeHandPos} />
			{gameStatus !== GameStatus.Started &&
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
			}
			{gameStatus === GameStatus.Started &&
				// <Canvas gl={{ logarithmicDepthBuffer: true }} shadows camera={{ position: [0, 0, 50], fov: 25 }}>
				// 	<fog attach="fog" args={['black', 15, 21.5]} />
				// 	<Stage intensity={0.5} environment="city" shadows={{ type: 'accumulative', bias: -0.001 }} adjustCamera={false}>
				// 		{Object.keys(clients.current)
				// 			.map((client) => {
				// 				// const { y, dir, score } = clients[client]
				// 				const { y, dir, score } = clients.current[client]
				// 				const pos = [client === id ? -10 : 10, y * 20 - 10, 0]
				// 				return (
				// 					<UserWrapper
				// 						key={client}
				// 						id={client}
				// 						score={score}
				// 						position={pos}
				// 						rotation={[0, dir, 0]}
				// 					/>
				// 				)
				// 			})}
				// 		{/* {clients[id] !== undefined && < BallWrapper ball={ball} client={clients[id]} />} */}
				// 		{clients.current[id] !== undefined && < BallWrapper ball={ball.current} client={clients.current[id]} />}
				// 	</Stage>
				// 	{/* <Grid renderOrder={-1} position={[0, -1.85, 0]} infiniteGrid cellSize={0.6} cellThickness={0.6} sectionSize={3.3} sectionThickness={1.5} sectionColor={[0.5, 0.5, 10]} fadeDistance={30} /> */}
				// 	{/* <OrbitControls autoRotate autoRotateSpeed={0.05} enableZoom={false} makeDefault minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
				// 	<EffectComposer disableNormalPass>
				// 		<Bloom luminanceThreshold={1} mipmapBlur />
				// 	</EffectComposer>
				// 	<Environment background preset="sunset" blur={0.8} />
				// </Canvas>
				<Canvas shadows camera={{ position: [0, 50, 200], fov: 60 }}>
					<Timer time={time} />
					{Object.keys(clients)
						.map((client) => {
							const { y, dir, score, xDistance } = clients[client]
							// console.log(client, id, client === id);
							const pos = [client == id.current ? -97.5 : 97.5, y, 0]
							// const pos = [client == id ? -97.5 : 97.5, y, 0]
							// const myPaddleColor = client == id ? paddleColor : '#fff';
							const myPaddleColor = client == id.current ? paddleColor : '#fff';
							// console.log(pos);
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
					{clients[id.current] !== undefined && < BallWrapper ball={ball} client={clients[id.current]} />}
					{/* {clients[id] !== undefined && < BallWrapper ball={ball} client={clients[id]} />} */}
					< color attach="background" args={["#171720"]} />
					<Plane receiveShadow args={[200, 100]} position={[0, 50, -5]} material={new THREE.MeshBasicMaterial({ color: 'blue' })} />
					<ambientLight intensity={0.5} />
					<pointLight position={[-100, -100, -10]} />
					<spotLight position={[100, 100, 10]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
					{/* <Grid renderOrder={-1} position={[0, -1.85, 0]} infiniteGrid cellSize={0.6} cellThickness={0.6} sectionSize={3.3} sectionThickness={1.5} sectionColor={[0.5, 0.5, 10]} fadeDistance={30} /> */}
				</Canvas>
			}
		</>
	)
}