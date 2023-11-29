import { useEffect, useState } from "react";
import { Modal, Image } from "react-bootstrap";
import DefaultAvatar from '../../assets/defaultAvatar.png'

export const GameSummaryModal = ({ summary }: any) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	useEffect(() => {
		if (summary) {
			handleShow();
		}
	}, [summary]);

	return (
		<>
			{summary &&
				<Modal size="lg"
					aria-labelledby="contained-modal-title-vcenter"
					centered show={show} onHide={handleClose}>
					<Modal.Header closeButton>
						{summary.winner ?
							<>

								<Image style={{ objectFit: "cover", marginRight: "1rem" }} src={summary.winner.avatar || DefaultAvatar} height={50} width={50} roundedCircle />
								<Modal.Title className="text-black">{summary.winner.username} won the game !</Modal.Title>
							</> : <Modal.Title className="text-black">It's a draw !</Modal.Title>}
					</Modal.Header>
					<Modal.Body className="text-black">
						{summary.winner ?
							`Score : ${summary.winner.score} - ${summary.loser.score}`
							:
							"No one won this game"}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-primary" onClick={handleClose}>
							Close
						</button>
					</Modal.Footer>
				</Modal>}
		</>
	);
};
