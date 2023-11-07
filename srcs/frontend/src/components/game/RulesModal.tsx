import { useState } from "react";
import { Modal } from "react-bootstrap";

export const RulesModal = () => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<button className="btn btn-info" onClick={handleShow}>
				Show Rules
			</button>

			<Modal size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title className="text-black">Rules</Modal.Title>
				</Modal.Header>
				<Modal.Body className="text-black">Pong is one of the first computer games ever created. This simple "tennis like" game features two paddles and a ball, the goal is to defeat your opponent by being the first one to gain 5 points, a player gets a point once the opponent misses a ball. The game can be played with two human players, or one player against a computer controlled paddle.
					Use the up and down arrows or W and S to move your paddle. You can also play with your hands, using your computer camera.</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-primary" onClick={handleClose}>
						Close
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
};
