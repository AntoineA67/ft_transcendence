import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, Outlet } from "react-router-dom";

export function Title({title}: {title: string}) {
	return (
		<div className='d-flex w-100 align-items-center' style={{ backgroundColor: "black"}}>
			<Link to=".."><button className='goBack'></button></Link>
			<h4 style={{color: "white", margin: "auto 0"}}>{title}</h4>
		</div>
	);
} 

export function ChangePassword() {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		console.log('handle submit: change password');
	};
	
	return (
		<Container fluid className='px-0 h-75'>
			<Title title="Change password" />
			<Stack className="col-12 col-sm-4 p-3 p-sm-5 h-100" style={{minHeight: '400px' }}>
				<form className='h-100 d-flex flex-column gap-3' onSubmit={handleSubmit}>
					<div >
						<label htmlFor="current-password" className="form-label">Curent password</label>
						<input type="password" className="form-control" id="current-password" aria-describedby='' />
					</div>
					<div>
						<label htmlFor="new-password" className="form-label">New password</label>
						<input type="password" className="form-control" id="new-password" />
					</div>
					<div>
						<label htmlFor="confirm-password" className="form-label">Confirm password</label>
						<input type="password" className="form-control" id="confirm-password" />
					</div>
					<div  style={{color: 'white'}}>Error message if any</div>
					<button type='submit' className='btn btn-outline-secondary w-100 mt-auto mb-5 mb-sm-0'>Confirm</button>
				</form>
			</Stack>
		</Container>
	);
}

export function SettingMenu() {
	return (
		<Container fluid className='px-0 h-75'>
			<Title title="Setting" />
			<Stack className="col-12 col-sm-4 p-3 p-sm-5 gap-5 h-100" style={{color: "white", minHeight: '400px', border: '1px solid red'}}>
				<Link to="changepassword" className='link-text link fs-5'>Change password </Link>
				<Link to="." className='link-text link fs-5'>Double Authenticate </Link>
				<Link to="." className='link-text link fs-5'>Change sth else </Link>
				<button className='btn btn-outline-secondary w-100 mt-auto mb-5 mb-sm-0'>Log out</button>
			</Stack>
		</Container>
	);
}

export function Setting() {
	return (
		<Outlet />
	)
}