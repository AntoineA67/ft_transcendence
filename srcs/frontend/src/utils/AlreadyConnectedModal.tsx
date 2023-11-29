import { useEffect, useState } from "react";
import { Modal, Image } from "react-bootstrap";

export const AlreadyConnectedModal = ({ summary }: any) => {
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
					centered show={show} >
					{/* onHide={handleClose} */}
					<Modal.Header>
						<Modal.Title className="text-black">Already connected</Modal.Title>
					</Modal.Header>
					<Modal.Body className="text-black">
						Oops, you are already connected elsewhere, please disconnect first.
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-primary" onClick={() => { window.location.reload() }}>
							Retry
						</button>
					</Modal.Footer>
				</Modal>}
		</>
	);
};
