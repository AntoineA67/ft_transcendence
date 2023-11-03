import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Box, CameraShake, ContactShadows, Plane, Text } from "@react-three/drei"
import { FidgetSpinner } from "react-loader-spinner"
import { Card } from "react-bootstrap"
import { gamesSocket, socket as globalSocket } from '../utils/socket';
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
				material={new THREE.MeshStandardMaterial()}
			>
			</mesh>
		</>
	)
}

const UserWrapper = ({ position, rotation, id, score, paddleColor }: any) => {
	return (
		<>
			<Text
				position={[0, 20, 0]}
				color="white"
				anchorX="center"
				anchorY="middle"
				scale={[10, 10, 10]}
			>
				{score}
			</Text>
			{/* <Box position={position} /> */}
			<mesh
				position={position}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry(5, 20, 2)}
				material={new THREE.MeshStandardMaterial({ color: paddleColor })}
			>
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

enum GameStatus {
	Idle = 'idle',
	Matching = 'matching',
	Started = 'started',
	Finished = 'finished',
}

const Test = () => {
	const { camera, gl } = useThree() as any

	const onWindowResize = () => {

		camera.aspect = window.innerWidth / window.innerHeight;
		// console.log(window.innerWidth, window.innerHeight)
		let newFov = (2000 / window.innerWidth) * 30 + (window.innerWidth * .015)
		if (window.innerWidth < 400) {
			newFov = 120
		} else if (window.innerWidth < 800) {
			newFov = 90
		} else if (window.innerWidth < 1600) {
			newFov = 70
		} else {
			newFov = 60
		}
		// const horizontalFOV = 2 * Math.atan(Math.tan((60 / 2) * (Math.PI / 180))) * (180 / Math.PI);
		// console.log(newFov)
		camera.fov = newFov
		// camera.position.set(camera.position.x, camera.position.y, camera.position.z * (1000 / camera.innerWidth))
		camera.updateProjectionMatrix();

		gl.setSize(window.innerWidth, window.innerHeight);

	}
	onWindowResize()
	useEffect(() => {
		window.addEventListener('resize', onWindowResize, false);
		return () => {
			window.removeEventListener('resize', onWindowResize, false);
		}
	}, [])

	return (
		<></>
	)
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
		handPos.current = pos
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
			if (params.userId && params.userId != res.id) {
				console.log("Matching against", params.userId);
				gamesSocket.emit('matchAgainst', params.userId);
				if (gameStatus === GameStatus.Matching || gameStatus === GameStatus.Started) return
				// gamesSocket.emit('match');
				setGameStatus(GameStatus.Matching);
			}
		});
		const paddleColor = gamesSocket.emit('getMyPaddleColor', (res: any) => {
			// console.log("MyColor", res.paddleColor);
			setPaddleColor(res.paddleColor);
		});
		gamesSocket.on('startGame', (newId: any) => {
			const paddleColor = gamesSocket.emit('getMyPaddleColor', (res: any) => {
				// console.log("MyColor", res.paddleColor);
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
					// console.log(pos, currentPos, keysPressed.current)
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

	// const setCanvasSize = () => {
	// 	let scale = 0;
	// 	if (window.innerHeight * 0.003921569 / 2 >= window.innerWidth * 0.001666667 / 2) {
	// 		scale = window.innerWidth * 0.001666667 / 2;
	// 	}
	// 	else {
	// 		scale = window.innerHeight * 0.003921569 / 2;
	// 	}
	// 	if (scale > 1) {
	// 		scale = 1;
	// 	}

	// 	let gameCanvas = document.getElementById('game-canvas');
	// 	if (gameCanvas) {
	// 		console.log("test")
	// 		gameCanvas.style.transform = `scale(${scale})`;
	// 	}
	// }
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
			// window.addEventListener("resize", setCanvasSize);
			window.addEventListener('keydown', onkeydown);
			window.addEventListener('keyup', onkeyup);
			return () => {
				// window.removeEventListener("resize", setCanvasSize);
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
				// <Canvas style={{ zIndex: -1 }} shadows camera={{ position: [0, 50, 200], fov: 60 }}>
				// 	<Timer time={time} />
				// 	{Object.keys(clients)
				// 		.map((client) => {
				// 			const { y, dir, score, xDistance } = clients[client]
				// 			// console.log(client, id, client === id);
				// 			const pos = [client == id.current ? -97.5 : 97.5, y, 0]
				// 			const myPaddleColor = client == id.current ? paddleColor : '#fff';
				// 			// console.log(pos);
				// 			return (
				// 				<UserWrapper
				// 					key={client}
				// 					id={client}
				// 					score={score}
				// 					position={pos}
				// 					rotation={[0, dir, 0]}
				// 					paddleColor={myPaddleColor}
				// 				/>
				// 			)
				// 		})}
				// 	{clients[id.current] !== undefined && < BallWrapper ball={ball} client={clients[id.current]} />}
				// 	< color attach="background" args={["#171720"]} />
				// 	<Plane receiveShadow args={[200, 100]} position={[0, 50, -5]} material={new THREE.MeshStandardMaterial({ color: 'blue' })} />
				// 	<ambientLight intensity={0.5} />
				// 	<pointLight position={[-100, -100, -10]} />
				// 	<spotLight position={[100, 100, 10]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
				// </Canvas>

				// <main className={"bright"}>

				// <Canvas resize={{ polyfill: ResizeObserver }} camera={{ position: [0, 100, 200], fov: 60, near: 60, far: 250 }}>
				// <div style={{ width: "50vw", height: "100vh" }}>

				// <Canvas style={{ width: "1200px", height: "500px" }} id="game-canvas" camera={{ rotation: [.005, 0, 0], position: [0, 50, 200], fov: 60, near: 60, far: 250 }}>
				<Canvas id="game-canvas" camera={{ rotation: [.005, 0, 0], position: [0, 50, 200], fov: 60, near: 60, far: 250 }}>
					{/* <pointLight color={['#f0f0f0', '#d25578'])} position={[100, 100, 25]} intensity={0.5} /> */}
					<pointLight color={'#f0f0f0'} position={[100, 100, 25]} intensity={1.5} />
					<Box position={[50, 50, 25]} scale={10} material={new THREE.MeshStandardMaterial({ color: 'red' })} />
					<Box position={[0, 0, 0]} scale={10} material={new THREE.MeshStandardMaterial({ color: 'red' })} />
					{/* <pointLight position={[-100, -100, -100]} intensity={1.5} color={"#00ffff"} /> */}

					<Box position={[-100, -100, -100]} scale={10} />
					{/* <pointLight position={[-100, -100, -100]} intensity={1.5} color={snap.dark ? "#ccffcc" : "#00ffff"} /> */}
					<ambientLight intensity={0.1} />
					<Test />
					<group position-y={2}>
						<Timer time={time} />
						{Object.keys(clients)
							.map((client) => {
								const { y, dir, score, xDistance } = clients[client]
								// console.log(client, id, client === id);
								const pos = [client == id.current ? -97.5 : 97.5, y, 0]
								const myPaddleColor = client == id.current ? paddleColor : '#fff';
								// if (client == id.current) {
								// 	console.log(y, pos);
								// }
								return (
									// <>
									<UserWrapper
										key={client}
										id={client}
										score={score}
										position={pos}
										rotation={[0, dir, 0]}
										paddleColor={myPaddleColor}
									/>
									// 		<Text
									// 			key={client + "score"}
									// 			position={[pos[0] > 0 ? pos[0] + 20 : pos[0] - 20, 50, 0]}
									// 			color="white"
									// 			anchorX="center"
									// 			anchorY="middle"
									// 			scale={[20, 20, 20]}
									// 		> 
									// { score }
									// 		</Text>
									// </>
								)
							})}
						{clients[id.current] !== undefined && < BallWrapper ball={ball} client={clients[id.current]} />}
						< color attach="background" args={["#171720"]} />
						<Plane receiveShadow args={[200, 100]} position={[0, 50, -3]} material={new THREE.MeshStandardMaterial({ color: 'blue' })} />
						< ContactShadows position={[0, -2, 0]} opacity={0.4} width={30} height={30} blur={1} far={15} />
					</group >
					{/* <CameraShake
						maxYaw={0.1} // Max amount camera can yaw in either direction
						maxPitch={0.1} // Max amount camera can pitch in either direction
						maxRoll={0.1} // Max amount camera can roll in either direction
						yawFrequency={0.1} // Frequency of the the yaw rotation
						pitchFrequency={0.1} // Frequency of the pitch rotation
						rollFrequency={0.1} // Frequency of the roll rotation
						intensity={1} // initial intensity of the shake
						decayRate={0.65} // if decay = true this is the rate at which intensity will reduce at />
					/> */}
				</Canvas >
				// </div>

				// </main>

			}
		</>
	)
}