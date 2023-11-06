import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { gamesSocket } from '../../utils/socket';
import { Wheel } from '@uiw/react-color';

export const PaddleWheel = ({ currentColor }: any) => {
	const [hex, setHex] = useState("#fff");

	useEffect(() => {
		setHex(currentColor);
	}, [currentColor]);
	return (
		<Card className="paddle-wheel-card m-5" style={{ maxWidth: "140px" }}>
			<Card.Header>Paddle Color</Card.Header>
			<Card.Body className="flex align-center">
				<Wheel
					style={{ minHeight: "20px" }}
					color={hex}
					width={100}
					height={100}
					onChange={(color) => {
						gamesSocket.emit('changeColor', color.hex);
						setHex(color.hex);
					}} />
			</Card.Body>
		</Card>
	);
};
