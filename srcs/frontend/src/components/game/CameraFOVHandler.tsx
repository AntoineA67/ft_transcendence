import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const CameraFOVHandler = () => {
	const { camera, gl } = useThree() as any;

	const onWindowResize = () => {

		camera.aspect = window.innerWidth / window.innerHeight;
		let newFov = (2000 / window.innerWidth) * 30 + (window.innerWidth * 0.015);
		if (window.innerWidth < 400) {
			newFov = 120;
		} else if (window.innerWidth < 600) {
			newFov = 105;
		} else if (window.innerWidth < 800) {
			newFov = 80;
		} else if (window.innerWidth < 1600) {
			newFov = 70;
		} else {
			newFov = 60;
		}
		camera.fov = newFov;
		camera.updateProjectionMatrix();
		gl.setSize(window.innerWidth, window.innerHeight);
	};
	useEffect(() => {
		onWindowResize();
		window.addEventListener('resize', onWindowResize, false);
		return () => {
			window.removeEventListener('resize', onWindowResize, false);
		};
	}, []);

	return (
		<></>
	);
};
