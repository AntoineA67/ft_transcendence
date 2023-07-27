import React, { useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';
import { socket } from './socket';
import * as THREE from 'three';

interface CubeProps {
	position: [number, number, number];
	rotation: [number, number, number];
}

function Cube({ position, rotation }: CubeProps) {
	return (
		<mesh position={position} rotation={rotation}>
			<boxGeometry args={[1, 1, 1]} />
			<meshBasicMaterial color={0x00ff00} wireframe={true} />
		</mesh>
	);
}

function Game() {
	useEffect(() => {
		const scene = new THREE.Scene()

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)
		const controls = new OrbitControls(camera, renderer.domElement)
		const myObject3D = new THREE.Object3D();
		myObject3D.position.x = Math.random() * 4 - 2;
		myObject3D.position.z = Math.random() * 4 - 2;

		let myId = '';
		let timestamp = 0;
		const clientCubes: { [id: string]: JSX.Element } = {};

		socket.on('connect', function () {
			console.log('connect');
		});

		socket.on('disconnect', function (message: any) {
			console.log('disconnect ' + message);
		});

		socket.on('id', (id: string) => {
			myId = id;
			console.log('id ' + id);
			setInterval(() => {
				socket.emit('update', {
					t: Date.now(),
					p: myObject3D.position,
					r: myObject3D.rotation,
				});
			}, 50);
		});

		socket.on('clients', (clients: any) => {
			let pingStatsHtml = 'Socket Ping Stats<br/><br/>';
			Object.keys(clients).forEach((p) => {
				timestamp = Date.now();
				pingStatsHtml += p + ' ' + (timestamp - clients[p].t) + 'ms<br/>';
				if (!clientCubes[p]) {
					clientCubes[p] = <Cube key={p} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
				} else {
					if (clients[p].p) {
						new TWEEN.Tween(clientCubes[p].props.position)
							.to(
								{
									x: clients[p].p.x,
									y: clients[p].p.y,
									z: clients[p].p.z,
								},
								5
							)
							.start();
					}
					if (clients[p].r) {
						new TWEEN.Tween(clientCubes[p].props.rotation)
							.to(
								{
									x: clients[p].r._x,
									y: clients[p].r._y,
									z: clients[p].r._z,
								},
								5
							)
							.start();
					}
				}
			});
			(document.getElementById('pingStats') as HTMLDivElement).innerHTML = pingStatsHtml;
		});

		socket.on('removeClient', (id: string) => {
			delete clientCubes[id];
		});

		const animate = function () {
			controls.update();
			TWEEN.update();
		};

		animate();

		// Cleanup function to dispose of the Three.js objects when the component unmounts
		return () => {
			controls.dispose();
		};
	}, []); // Empty dependency array to run this effect only once on mount

	return <div id="pingStats"></div>;
}

export default function App() {
	return (
		<Canvas>
			<Game />
		</Canvas>
	);
}
