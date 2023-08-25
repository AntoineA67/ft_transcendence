import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

import '../styles/Stat.css';

function History() {
	return (
		<>
		</>
	);
}

function Achieve() {
	
	
	return (
		<></>
	);
}

function PieChart() {

}

export default function Stat() {

	return (
		<>
			{/* small screen  */}
			<Container className="mb-5 pb-5 d-sm-none" 
				style={{color: "white", border: "1px solid white"}}>
				<div className="row">
					<div className="col-6">
						<h5 className="tab-main-color" id="history"> 
							History
						</h5>
					</div>

					<div className="col-6">
						<h5 className="tab-greyout" id="achieve">
							Achieve.
						</h5>
					</div>
				</div>
				<div>content</div>
			</Container>

			{/* big screan */}
			<Container className="d-none d-sm-block"
				style={{ color: "white", border: "1px solid white" }}>
				<div className="row">
					<div className="col-6">
						<h5 className="tab-main-color"> 
							History
						</h5>
						<div>
							content
						</div>
					</div>

					<div className="col-6">
						<h5 className="tab-main-color">
							Achievement
						</h5>
						<div>
							content
						</div>
					</div>
				</div>
			</Container>
		</>
	);
	
}
