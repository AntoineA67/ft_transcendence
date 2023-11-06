import { Ref } from "react";
import { CameraShake, ShakeController } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export const CanvasGraphicEffects = ({ cameraShakeRef }: { cameraShakeRef: Ref<ShakeController | undefined>; }) => {
	return (
		<>
			<CameraShake
				maxYaw={0.01} // Max amount camera can yaw in either direction
				maxPitch={0.01} // Max amount camera can pitch in either direction
				maxRoll={0.01} // Max amount camera can roll in either direction
				yawFrequency={1} // Frequency of the the yaw rotation
				pitchFrequency={1} // Frequency of the pitch rotation
				rollFrequency={1} // Frequency of the roll rotation
				intensity={0} // initial intensity of the shake
				decayRate={0.3} // if decay = true this is the rate at which intensity will reduce at
				decay={true}
				ref={cameraShakeRef} />
			<EffectComposer multisampling={4} disableNormalPass>
				<Bloom luminanceThreshold={0.5} intensity={0.3} levels={5} mipmapBlur />
				<Bloom luminanceThreshold={0.5} intensity={0.1} levels={6} mipmapBlur />
			</EffectComposer>
		</>
	);
};
