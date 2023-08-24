
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';
import { Link, Outlet } from "react-router-dom";

export function Title({title}: {title: string}) {
	return (
		<div className='d-flex w-100' style={{ backgroundColor: "black"}}>
			<Link to=".."><button className='goBack'></button></Link>
			<h4 style={{color: "white", margin: "auto 0"}}>{title}</h4>
		</div>
	);
} 


export default function ProfileSetting() {
	return (
		<>
			<Stack className="mb-5 d-flex flex-column align-items-center" style={{ color: "white", border: "2px solid white" }}>
				<Title title="Setting"></Title>
				<Link to="." className='link-text fs-5 mt-4'>Change password </Link>
				<Link to="." className='link-text fs-5 mt-4'>Double Authenticate </Link>
				<Link to="." className='link-text fs-5 mt-4'>Change password </Link>
				<button className="btn btn-outline-secondary mt-auto w-50" >
					Log out
				</button>

			</Stack>
		</>
	);
}