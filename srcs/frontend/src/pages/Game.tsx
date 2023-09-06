import * as THREE from "three"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Box, KeyboardControls, OrbitControls, Text, useGLTF, useKeyboardControls, useTexture } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane } from "@react-three/cannon"
import { proxy, useSnapshot } from "valtio"
import clamp from "lodash-es/clamp"
// import pingSound from "./resources/ping.mp3"
// import earthImg from "./resources/cross.jpg"
// import { socket } from "../utils/socket"
// import { Socket } from "socket.io-client"
import { stat } from "fs"
import { SocketProvider, useSocket } from "../utils/socket"
import { Socket } from "socket.io-client"

// const ping = new Audio(pingSound)
const state = proxy({
	count: 0,
	ball: { 'position': null, 'rotation': null } as any,
})

const ControlsWrapper = () => {
	const socket: any = useSocket();
	const controlsRef = useRef(null!) as any
	const [updateCallback, setUpdateCallback] = useState(null)

	// Register the update event and clean up
	useEffect(() => {
		const onControlsChange = (val: any) => {
			const { position, rotation } = val.target.object
			const { id } = socket

			const posArray: any[] = []
			const rotArray: any[] = []

			position.toArray(posArray)
			rotation.toArray(rotArray)

			socket.emit('move', {
				id,
				rotation: rotArray,
				position: posArray,
			})
		}

		if (controlsRef.current) {
			setUpdateCallback(
				controlsRef.current.addEventListener('change', onControlsChange)
			)
		}

		// Dispose
		return () => {
			if (updateCallback && controlsRef.current)
				controlsRef.current.removeEventListener(
					'change',
					onControlsChange
				)
		}
	}, [controlsRef, socket])

	return <OrbitControls ref={controlsRef} />
}
const BallWrapper = ({ ball, client }: any) => {
	// useFrame(() => {
	// 	console.log("position", position)
	// })
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

const UserWrapper = ({ position, rotation, id }: any) => {
	// useFrame(() => {
	// 	console.log("position", position)
	// })
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
					{id}
				</Text>
			</mesh>
		</>
	)
}


export default function Game() {

	const [clients, setClients] = useState({} as any)
	const [id, setId] = useState('' as any)
	// const [renderBall, setRenderBall] = useState(false as boolean)
	const [ball, setBall] = useState({} as any)
	const keysPressed = useRef({ up: false, down: false, time: Date.now() } as any)
	const jsp = useRef('non' as any)
	const socket = useSocket()

	useEffect(() => {
		socket.emit('match')
		console.log('match')
		return () => {
			if (socket) socket.disconnect()
		}
	}, [])

	useEffect(() => {
		if (socket) {
			socket.on('connect', function () {
				console.log('connect')
			})
			socket.on('disconnect', function (message: any) {
				console.log('disconnect ' + message)
			})

			socket.on('id', (newId: any) => {
				setId(newId)
				console.log('id: ', id)
			})

			socket.on('clients', (newClients: any) => {
				setClients(newClients.clients)
				if (newClients.ball) {
					setBall(newClients.ball)
					// console.log(newClients.ball)
				}
			})
		}
	}, [socket])
	const sendPressed = (key: string, pressed: boolean) => {
		keysPressed.current[key] = pressed
		keysPressed.current.time = Date.now()
		socket.emit("keyPresses", keysPressed.current);
		console.log("sendPressed", keysPressed.current)
	}
	useEffect(() => {
		window.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.repeat) return
			if (event.key === "ArrowUp" || event.key === "w") { sendPressed("up", true) }
			if (event.key === "ArrowDown" || event.key === "s") { sendPressed("down", true) }
		});
		window.addEventListener('keyup', (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key === "w") { sendPressed("up", false) }
			if (event.key === "ArrowDown" || event.key === "s") { sendPressed("down", false) }
		});
		return () => {
			// unregister eventListener once
			// window.removeEventListener('keydown', () => { console.log('remove keydown') });
			// window.removeEventListener('keyup', () => { console.log('remove keyup') });
		};
	}, [jsp])
	useEffect(() => {
		socket.on('start', (roomId) => {
			jsp.current = roomId
			console.log("start", roomId)
		})
		// setTimeout(() => {
		// 	jsp.current = "oui"
		// 	console.log("ouioui")
		// }, 5000)
	}, [])

	return (

		<Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
			{/* {Object.keys(clients)
				.map((client) => {
					return (
						<Text key={client} fontSize={.5}
						>{client}</Text>
					)
				})} */}
			{Object.keys(clients)
				.map((client) => {
					const { y, dir } = clients[client]
					const pos = [client === id ? -10 : 10, y * 20 - 10, 0]
					return (
						<UserWrapper
							key={client}
							id={client}
							position={pos}
							rotation={[0, dir, 0]}
						/>
					)
				})}
			{clients[id] !== undefined && < BallWrapper ball={ball} client={clients[id]} />}
			{/* {ball.position !== null && !renderBall && <UserWrapper
				key={ball.position}
				id={ball.position}
				position={ball.position}
				rotation={ball.rotation}
			/>} */}
			< color attach="background" args={["#171720"]} />
			<ambientLight intensity={0.5} />
			<pointLight position={[-10, -10, -10]} />
			<spotLight position={[10, 10, 10]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
		</Canvas>
	)
}