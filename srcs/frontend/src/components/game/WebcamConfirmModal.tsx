import { Modal } from "react-bootstrap";
import { useState } from "react";


export const WebcamConfirmModal = ({ confirmAction, cancelAction }: { confirmAction: (e: any) => void; cancelAction: (e: any) => void; }) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<button id="webcamButton" className="btn btn-secondary" onClick={handleShow}>Play using webcam !</button>
			<Modal size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title className="text-black">Are you sure ?</Modal.Title>
				</Modal.Header>
				<Modal.Body className="text-black">
					Loading this machine learning model could burn your computer ! Use at your own risk !
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-primary" onClick={(e: any) => { handleClose(); confirmAction(e); }}>
						Yes !
					</button>
					<button className="btn btn-danger" onClick={(e: any) => { handleClose(); cancelAction(e); }}>
						Cancel
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
};
