import { Text } from "@react-three/drei";
import * as THREE from "three"

export const UserWrapper = ({ position, rotation, id, score, paddleColor }: any) => {
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
			<mesh
				position={position}
				geometry={new THREE.BoxGeometry(5, 20, 2)}
				material={new THREE.MeshStandardMaterial({ color: paddleColor, emissive: paddleColor, emissiveIntensity: 3, toneMapped: false })}
			>
			</mesh >
		</>
	)
}