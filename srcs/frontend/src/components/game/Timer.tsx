import { Text } from "@react-three/drei";


export const Timer = ({ time }: any) => {
	const minutes = Math.floor(time / 60 / 1000)
	const seconds = Math.floor(time / 1000 % 60)
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
