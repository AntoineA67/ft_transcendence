import '../styles/App.css';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import TWEEN from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { socket } from '../socket';

function Game() {
	useEffect(() => {
		const scene = new THREE.Scene()

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)

		const controls = new OrbitControls(camera, renderer.domElement)

		const geometry = new THREE.BoxGeometry()
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true,
		})

		const myObject3D = new THREE.Object3D()
		myObject3D.position.x = Math.random() * 4 - 2
		myObject3D.position.z = Math.random() * 4 - 2

		const gridHelper = new THREE.GridHelper(10, 10)
		gridHelper.position.y = -0.5
		scene.add(gridHelper)

		camera.position.z = 4

		window.addEventListener('resize', onWindowResize, false)
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight
			camera.updateProjectionMatrix()
			renderer.setSize(window.innerWidth, window.innerHeight)
			render()
		}

		let myId = ''
		let timestamp = 0
		const clientCubes: { [id: string]: THREE.Mesh } = {}
		socket.on('connect', function () {
			console.log('connect')
		})
		socket.on('disconnect', function (message: any) {
			console.log('disconnect ' + message)
		})
		socket.on('id', (id: any) => {
			myId = id
			console.log('id ' + id)
			setInterval(() => {
				socket.emit('update', {
					t: Date.now(),
					p: myObject3D.position,
					r: myObject3D.rotation,
				})
			}, 50)
		})
		socket.on('clients', (clients: any) => {
			let pingStatsHtml = 'Socket Ping Stats<br/><br/>'
			Object.keys(clients).forEach((p) => {
				// if (p === myId) return
				timestamp = Date.now()
				pingStatsHtml += p + ' ' + (timestamp - clients[p].t) + 'ms<br/>'
				if (!clientCubes[p]) {
					clientCubes[p] = new THREE.Mesh(geometry, material)
					clientCubes[p].name = p
					scene.add(clientCubes[p])
				} else {
					// if (myId === p) {
					// 	clientCubes[p].position.set(
					// 		myObject3D.position.x,
					// 		myObject3D.position.y,
					// 		myObject3D.position.z)
					// 	clientCubes[p].rotation.set(
					// 		myObject3D.rotation.x,
					// 		myObject3D.rotation.y,
					// 		myObject3D.rotation.z)
					// 	return
					// }
					if (clients[p].p) {
						// clientCubes[p].position.x = clients[p].p.x
						// clientCubes[p].position.y = clients[p].p.y
						// clientCubes[p].position.z = clients[p].p.z
						new TWEEN.Tween(clientCubes[p].position)
							.to(
								{
									x: clients[p].p.x,
									y: clients[p].p.y,
									z: clients[p].p.z,
								},
								5
							)
							.start()
					}
					if (clients[p].r) {
						// clientCubes[p].rotation.x = clients[p].r._x
						// clientCubes[p].rotation.y = clients[p].r._y
						// clientCubes[p].rotation.z = clients[p].r._z
						new TWEEN.Tween(clientCubes[p].rotation)
							.to(
								{
									x: clients[p].r._x,
									y: clients[p].r._y,
									z: clients[p].r._z,
								},
								5
							)
							.start()
					}
				}
			})
				; (document.getElementById('pingStats') as HTMLDivElement).innerHTML = pingStatsHtml
		})
		socket.on('removeClient', (id: string) => {
			scene.remove(scene.getObjectByName(id) as THREE.Object3D)
		})

		const stats = new Stats()
		document.body.appendChild(stats.dom)

		const gui = new GUI()
		const cubeFolder = gui.addFolder('Cube')
		const cubePositionFolder = cubeFolder.addFolder('Position')
		cubePositionFolder.add(myObject3D.position, 'x', -5, 5)
		cubePositionFolder.add(myObject3D.position, 'z', -5, 5)
		cubePositionFolder.open()
		const cubeRotationFolder = cubeFolder.addFolder('Rotation')
		cubeRotationFolder.add(myObject3D.rotation, 'x', 0, Math.PI * 2, 0.01)
		cubeRotationFolder.add(myObject3D.rotation, 'y', 0, Math.PI * 2, 0.01)
		cubeRotationFolder.add(myObject3D.rotation, 'z', 0, Math.PI * 2, 0.01)
		cubeRotationFolder.open()
		cubeFolder.open()

		const animate = function () {
			requestAnimationFrame(animate)

			controls.update()

			TWEEN.update()

			if (clientCubes[myId]) {
				camera.lookAt(clientCubes[myId].position)
			}

			render()

			stats.update()
		}

		const render = function () {
			renderer.render(scene, camera)
		}

		animate()

		// Cleanup function to dispose of the Three.js objects when the component unmounts
		return () => {
			controls.dispose();
			renderer.dispose();
		};
	}, []); // Empty dependency array to run this effect only once on mount

	return <div id="pingStats"></div>; // Empty fragment, as we don't need to render any specific React elements
};

export default Game;