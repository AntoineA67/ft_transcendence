import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Box, Text } from "@react-three/drei"
import { useSocket } from "../utils/socket"
import { Circles, FidgetSpinner } from "react-loader-spinner"

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
				geometry={new THREE.BoxGeometry()}
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
	const [id, setId] = useState('' as any)
	const [ball, setBall] = useState({} as any)
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle)
	const socket = useSocket();

	useEffect(() => {
		socket?.on('connect', function () {
			console.log('connect')
		})
		socket?.on('disconnect', function (message: any) {
			console.log('disconnect ' + message)
		})

		socket?.on('id', (newId: any) => {
			setId(newId)
			console.log('id: ', id)
		})
		socket?.on('startGame', (newId: any) => {
			setGameStatus(GameStatus.Started);
			console.log('Game Started!')
		})
		socket?.on('clients', (newClients: any) => {
			setClients(newClients.clients)
			if (newClients.ball) {
				setBall(newClients.ball)
			}
		})
		socket?.on('gameOver', (winner: any) => {
			console.log('Game Over! Winner: ', winner);
			setGameStatus(GameStatus.Finished);
		})
		return () => {
			socket?.disconnect();
		}
	}, [socket])
	const sendPressed = (key: string, pressed: boolean) => {
		keysPressed.current[key] = pressed
		keysPressed.current.time = Date.now()
		socket?.emit("keyPresses", keysPressed.current);
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
	const handleMatchClick = () => {
		setGameStatus(GameStatus.Matching);
		socket?.emit('match');
	};

	return (
		<>
			{gameStatus === GameStatus.Idle && <button onClick={handleMatchClick} disabled={!socket?.connected}>Match</button>}
			{gameStatus === GameStatus.Matching && <FidgetSpinner
				visible={socket?.connected}
				height="80"
				width="80"
				ariaLabel="dna-loading"
				wrapperStyle={{}}
				wrapperClass="dna-wrapper"
				ballColors={['#ff0000', '#00ff00', '#0000ff']}
				backgroundColor="#F4442E"
			/>}
			{gameStatus === GameStatus.Finished && <Circles
				height="80"
				width="80"
				color="#4fa94d"
				ariaLabel="circles-loading"
				wrapperStyle={{}}
				wrapperClass=""
				visible={true}
			/>}



			<Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
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
		</>
	)
}