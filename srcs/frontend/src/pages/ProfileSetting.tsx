import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, Outlet } from "react-router-dom";

export function Title({title}: {title: string}) {
	return (
		<div className='d-flex w-100' style={{ backgroundColor: "black"}}>
			<Link to=".."><button className='goBack'></button></Link>
			<h4 style={{color: "white", margin: "auto 0"}}>{title}</h4>
		</div>
	);
} 

export function ChangePassword() {
	return (
		<div></div>
	);
}

export default function ProfileSetting() {
	return (
		<>
			<Title title="Setting" />
			<Stack className="col-sm-4 mx-auto" style={{color: "white" }}>
				<Link to="." className='link-text link fs-5 m-3'>Change password </Link>
				<Link to="." className='link-text link fs-5 m-3'>Double Authenticate </Link>
				<Link to="." className='link-text link fs-5 m-3'>Change sth else </Link>
				<Link to="." className='link-text link fs-5 m-3'>Log out</Link>
			</Stack>
		</>

		// <div style={{height: "100%", width: "100%"}}>
		// 	<div style={{backgroundColor: "black", color: "white"}}>hello</div>
		// 	<Container style={{border: "1px solid white"}}>
		// 		<Row className="justify-content-center h-100">
		// 			{/* <Title title="Setting"></Title> */}
		// 			<Col sm="6" lg="4" className="d-flex flex-column">
						// <Link to="." className='link-text link fs-5 mt-4'>Change password </Link>	
						// <Link to="." className='link-text link fs-5 mt-4'>Double Authenticate </Link>
						// <Link to="." className='link-text link fs-5 mt-4'>Change password </Link>
						// <button className="btn btn-outline-secondary mt-auto w-100" >
						// 	Log out
						// </button>
		// 			</Col>
		// 		</Row>
		// 	</Container>
		// </div>
			// <Stack gap={2} className="col-md-7 mx-auto" style={{ color: "white", border: "2px solid white" }}>
		// <>
		// 	<Stack className="d-flex flex-column align-items-center" style={{ color: "white", border: "2px solid white" }}>
				
		// 		<Title title="Setting"></Title>
		// 		<Link to="." className='link-text link fs-5 mt-4 d-inline'>Change password </Link>
			
		// 		<Link to="." className='link-text link fs-5 mt-4'>Double Authenticate </Link>
		// 		<Link to="." className='link-text link fs-5 mt-4'>Change password </Link>
		// 		<button className="btn btn-outline-secondary mt-auto w-50" >
		// 			Log out
		// 		</button>
		// 	</Stack>
		// </>
	);
}