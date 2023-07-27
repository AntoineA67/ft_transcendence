import * as THREE from "three"
import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Box, KeyboardControls, OrbitControls, Text, useGLTF, useKeyboardControls, useTexture } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane } from "@react-three/cannon"
import { proxy, useSnapshot } from "valtio"
import clamp from "lodash-es/clamp"
import pingSound from "./resources/ping.mp3"
import earthImg from "./resources/cross.jpg"
import { socket } from "../socket"
import { Socket } from "socket.io-client"
import { stat } from "fs"

const ping = new Audio(pingSound)
const state = proxy({
	count: 0,
	api: {
		pong(velocity: any) {
			ping.currentTime = 0
			ping.volume = clamp(velocity / 20, 0, 1)
			ping.play()
			if (velocity > 4) ++state.count
		},
		reset: () => (state.count = 0),
	},
	socketClient: null as Socket | null,
	ball: { 'position': null, 'rotation': null } as any,
})

function Paddle({ ball }: any) {
	// const model = useRef<THREE.Mesh>(null!) as any
	// const { count } = useSnapshot(state)
	// const { nodes, materials } = useGLTF("/pingpong.glb") as any
	// const [, get] = useKeyboardControls()
	// const [ref, api] = useBox(() => ({ type: "Kinematic", args: [3.4, 1, 3.5], onCollide: (e) => state.api.pong(e.contact.impactVelocity) })) as any
	useFrame((paddleState) => {
		// const { up, down } = get()
		// console.log(up, down)
		// model.current.rotation.x = THREE.MathUtils.lerp(model.current.rotation.x, 0, 0.2)
		// model.current.rotation.y = THREE.MathUtils.lerp(model.current.rotation.y, (paddleState.mouse.x * Math.PI) / 5, 0.2)
		// api.position.set(paddleState.mouse.x * 10, paddleState.mouse.y * 5, 0)
		// api.rotation.set(0, 0, model.current.rotation.y)
		// console.log(state.ball)
		// socket.emit('update', {
		// 	t: Date.now(),
		// 	p: [paddleState.mouse.x * 10, paddleState.mouse.y * 5, 0],
		// 	r: [0, 0, model.current.rotation.y],
		// 	ball: ball,
		// })
	})
	// useEffect((paddleState) => {
	//   setInterval(() => {
	//     socket.emit('update', {
	//     t: Date.now(),
	//     p: [paddleState.mouse.x * 10, paddleState.mouse.y * 5, 0],
	//     r: [0, 0, model.current.rotation.y],
	//     ball: ball,
	//   })
	//   }, 50)
	// }, [])
	return (
		<Box />
		// <mesh ref={ref} dispose={null}>
		// 	<group ref={model} position={[-0.05, 0.37, 0.3]} scale={0.15}>
		// 		<Text anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]} fontSize={10} children={count} />
		// 		<group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
		// 			<primitive object={nodes.Bone} />
		// 			<primitive object={nodes.Bone003} />
		// 			<primitive object={nodes.Bone006} />
		// 			<primitive object={nodes.Bone010} />
		// 			<skinnedMesh castShadow receiveShadow material={materials.glove} material-roughness={1} geometry={nodes.arm.geometry} skeleton={nodes.arm.skeleton} />
		// 		</group>
		// 		<group rotation={[0, -0.04, 0]} scale={141.94}>
		// 			<mesh castShadow receiveShadow material={materials.wood} geometry={nodes.mesh.geometry} />
		// 			<mesh castShadow receiveShadow material={materials.side} geometry={nodes.mesh_1.geometry} />
		// 			<mesh castShadow receiveShadow material={materials.foam} geometry={nodes.mesh_2.geometry} />
		// 			<mesh castShadow receiveShadow material={materials.lower} geometry={nodes.mesh_3.geometry} />
		// 			<mesh castShadow receiveShadow material={materials.upper} geometry={nodes.mesh_4.geometry} />
		// 		</group>
		// 	</group>
		// </mesh>
	)
}

function Ball({ onBallChange }: any) {
	const map = useTexture(earthImg)
	const prevPosition = useRef([0, 5, 0]);
	const prevRotation = useRef([0, 0, 0]);
	const [ref, api] = useSphere(() => ({ mass: 1, args: [0.5], position: [0, 5, 0] })) as any
	usePlane(() => ({
		type: "Static",
		rotation: [-Math.PI / 2, 0, 0],
		position: [0, -10, 0],
		onCollide: () => {
			api.position.set(0, 5, 0)
			api.velocity.set(0, 5, 0)
			state.api.reset()
		},
	}))
	const position = useRef([0, 0, 0])
	const rotation = useRef([0, 0, 0])
	useEffect(() => {
		const subscribe = api.position.subscribe((v: any) => (position.current = v))
		if (subscribe !== position.current)
			// console.log("position", position.current)
			return subscribe
	}, [])
	useEffect(() => {
		const subscribe = api.rotation.subscribe((v: any) => (rotation.current = v))
		// console.log("rotation", rotation.current)
		return subscribe
	}, [])
	useFrame(() => {
		onBallChange({ 'position': position.current, 'rotation': rotation.current })
	})

	return (
		<mesh castShadow ref={ref}>
			<sphereGeometry args={[0.5, 64, 64]} />
			<meshStandardMaterial map={map} />
		</mesh>
	)
}

const ControlsWrapper = ({ socket }: any) => {
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
const BallWrapper = ({ ball }: any) => {
	// useFrame(() => {
	// 	console.log("position", position)
	// })
	return (
		<>
			<Box position={[ball.x * 20 - 10, ball.y * 20 - 10, 0]} />
			<mesh
				position={[ball.x * 20 - 10, ball.y * 20 - 10, 0]}
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

interface PongProps {
	ready: boolean;
}

export default function Pong({ ready }: PongProps) {

	const [clients, setClients] = useState({} as any)
	const [id, setId] = useState('' as any)
	const [renderBall, setRenderBall] = useState(false as boolean)
	const [ball, setBall] = useState({} as any)

	useEffect(() => {
		state.socketClient = socket
		return () => {
			if (state.socketClient) state.socketClient.disconnect()
		}
	}, [])


	useEffect(() => {
		if (state.socketClient) {
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

			socket.on('clients', (newClients) => {
				setClients(newClients.clients)
				if (newClients.ball) {
					setBall(newClients.ball)
					console.log(newClients.ball)
				}
			})
		}
	}, [state.socketClient])
	useEffect(() => {
		window.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.repeat) return
			if (event.key === "ArrowUp" || event.key === "w") {
				socket.emit("UpKeyPressed", Date.now());
			}
			if (event.key === "ArrowDown" || event.key === "s") {
				socket.emit("DownKeyPressed", Date.now());
			}
		});
		window.addEventListener('keyup', (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key == "w") {
				socket.emit("UpKeyReleased", Date.now());
			}
			if (event.key === "ArrowDown" || event.key == "s") {
				socket.emit("DownKeyReleased", Date.now());
			}
		});
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
					// console.log("y", y, client)
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
			{ball.position !== null && < BallWrapper ball={ball} />}
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
			{/* <Paddle ball={ball} /> */}
		</Canvas>
		// </KeyboardControls>
	)
}
