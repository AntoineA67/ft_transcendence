import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { gamesSocket } from '../../utils/socket';

export const GraphicEffectsSettingsCard = ({ currentSettings }: any) => {
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		setChecked(currentSettings);
	}, [currentSettings]);

	return (
		<Card className="paddle-wheel-card m-5" style={{ maxWidth: "140px" }}>
			<Card.Header>Graphic Effects</Card.Header>
			<Card.Body className="flex align-center">
				<input type="checkbox"
					checked={checked}
					onChange={(e: any) => {
						gamesSocket.emit('setGraphicEffects', e.target.checked);
						setChecked(e.target.checked);
					}} />
			</Card.Body>
		</Card>
	);
};
