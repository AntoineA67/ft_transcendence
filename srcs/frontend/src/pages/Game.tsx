import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Box, Text } from "@react-three/drei"
import { Circles, FidgetSpinner } from "react-loader-spinner"
import { Card } from "react-bootstrap"
import { gamesSocket } from '../utils/socket';


const BallWrapper = ({ ball, client }: any) => {
	const ballClientPosition: THREE.Vector3 = useMemo(() => {
		const invertedX = client.invertedSide ? 1 - ball.x : ball.x
		// console.log("client", client)
		return new THREE.Vector3(invertedX * 20 - 10, ball.y * 20 - 10, 0);
	}, [ball, client]);
	return (
		<>
			<Box position={ballClientPosition} />
			<mesh
				position={ballClientPosition}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry()}
				material={new THREE.MeshBasicMaterial()}
			>
			</mesh>
		</>
	)
}

const UserWrapper = ({ position, rotation, id, score }: any) => {
	return (
		<>
			<Box position={position} />
			<mesh
				position={position}
				// rotation={rotation}
				geometry={new THREE.BoxGeometry(1, 2, 1)}
				material={new THREE.MeshNormalMaterial()}
			>
				<Text
					position={[0, 1.0, 0]}
					color="black"
					anchorX="center"
					anchorY="middle"
				>
					{score}
				</Text>
			</mesh>
		</>
	)
}

enum GameStatus {
	Idle = 'idle',
	Matching = 'matching',
	Started = 'started',
	Finished = 'finished',
}

export default function Game() {

	const [clients, setClients] = useState({} as any)
	// const clients = useRef({} as any)
	const [id, setId] = useState('' as any)
	const [ball, setBall] = useState({} as any)
	// const ball = useRef({} as any)
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle)
	// const socket = useGameSocket();

	useEffect(() => {
		// gamesSocket?.on('connect', function () {
		// 	console.log('connect')
		// })
		// gamesSocket?.on('disconnect', function (message: any) {
		// 	console.log('disconnect ' + message)
		// })

		gamesSocket?.on('id', (newId: any) => {
			setId(newId)
			console.log('id: ', id)
		})
		gamesSocket?.on('startGame', (newId: any) => {
			console.log('startGame: ', newId)
			setGameStatus(GameStatus.Started);
			console.log('Game Started!')
		})
		gamesSocket?.on('clients', (newClients: any) => {
			console.log('clients: ', newClients);
			setClients(newClients.clients)
			// clients.current = newClients.clients
			if (newClients.ball) {
				setBall(newClients.ball)
				// ball.current = newClients.ball
			}
		})
		gamesSocket?.on('gameOver', (winner: any) => {
			console.log('Game Over! Winner: ', winner);
			setGameStatus(GameStatus.Finished);
		})
		return () => {
			// gamesSocket?.disconnect();
		}
	}, [gamesSocket])
	const sendPressed = (key: string, pressed: boolean) => {
		keysPressed.current[key] = pressed
		keysPressed.current.time = Date.now()
		gamesSocket?.emit("keyPresses", keysPressed.current);
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
		if (gameStatus !== GameStatus.Idle) return
		gamesSocket?.emit('match');
		setGameStatus(GameStatus.Matching);
	};
	const cancelMatchmaking = () => {
		if (gameStatus !== GameStatus.Matching) return
		gamesSocket?.emit('cancel');
		setGameStatus(GameStatus.Idle);
	};

	return (
		<>
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
								<button onClick={startMatchmaking} disabled={!gamesSocket?.connected} className="btn btn-primary"><b>Play</b></button>
							</>}
							{gameStatus === GameStatus.Matching && <>
								<Card.Title>Matchmeking in progress</Card.Title>
								<Card.Text>
									Looking for another player
								</Card.Text>
								<FidgetSpinner
									visible={gamesSocket?.connected}
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
									null
								</Card.Text>
								<br></br>
								<button onClick={cancelMatchmaking} className="btn btn-primary"><b>Replay</b></button>
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
				<Canvas shadows camera={{ position: [0, 0, 50], fov: 30 }}>
					{Object.keys(clients)
						.map((client) => {
							const { y, dir, score } = clients[client]
							const pos = [client === id ? -10 : 10, y * 20 - 10, 0]
							return (
								<UserWrapper
									key={client}
									id={client}
									score={score}
									position={pos}
									rotation={[0, dir, 0]}
								/>
							)
						})}
					{clients[id] !== undefined && < BallWrapper ball={ball} client={clients[id]} />}
					< color attach="background" args={["#171720"]} />
					<ambientLight intensity={0.5} />
					<pointLight position={[-10, -10, -10]} />
					<spotLight position={[10, 10, 10]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
				</Canvas>
			}
		</>
	)
}