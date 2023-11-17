import React, { useState, useEffect } from 'react';

export default function Gyro() {

	const DeviceOrientation = () => {

		const handleOrientation = (event : any) => {
			const alpha = event.alpha;
			const beta = event.beta;
			const gamma = event.gamma;
			
			alert(gamma);
		  };

		useEffect(() => {
			window.addEventListener('deviceorientation', handleOrientation);
		}, []);

		return (
			<></>
		);
	};

	return (
		<>
			<DeviceOrientation></DeviceOrientation>
		</>
	)
}


