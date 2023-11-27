import { Box } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three"

export const BallWrapper = ({ ball, client, graphicEffects }: any) => {
	const ballClientPosition: THREE.Vector3 = useMemo(() => {
		const invertedX = client.invertedSide ? ball.x * -1 : ball.x;
		return new THREE.Vector3(invertedX, ball.y, 0);
	}, [ball, client]);
	return (
		<>
			<Box position={ballClientPosition} />
			<mesh
				position={ballClientPosition}
				geometry={new THREE.BoxGeometry(2, 2, 2)}
				material={graphicEffects ? new THREE.MeshStandardMaterial({ color: [3, 3, 3] as any, toneMapped: false }) : new THREE.MeshBasicMaterial()}
			>
			</mesh>
		</>
	)
}