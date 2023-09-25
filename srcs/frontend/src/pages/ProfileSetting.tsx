import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { socket } from '../utils/socket';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';


export function Title({ title }: { title: string }) {
	return (
		<div className='d-flex w-100 align-items-center' style={{ backgroundColor: "black" }}>
			<Link to=".."><button className='goBack'></button></Link>
			<h4 style={{ color: "white", margin: "auto 0" }}>{title}</h4>
		</div>
	);
}

function InputPassword({ id, togglePassword }: { id: string, togglePassword: (id: string) => void }) {
	return (
		<div>
			<label htmlFor={id} className="form-label">{id}</label>
			<input type="password" className="form-control" id={id} />
			<div className="d-flex justify-content-end">
				<img
					id="eye"
					src={eyeopen}
					onClick={() => togglePassword(id)}
					className="ms-5 togglePassword" />
			</div>
		</div>
	);
}

export function ChangePassword() {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		console.log('handle submit: change password');
	};

	const togglePassword = (id: string) => {
		let x = document.getElementById(id) as HTMLInputElement;
		let eye = document.getElementById("eye") as HTMLImageElement;
		if (x.type === "password") {
			x.type = "text";
			eye.src = eyeclose;
		} else {
			x.type = "password";
			eye.src = eyeopen;
		}
	}

	return (
		<Container fluid className='px-0 h-75'>
			<Title title="Change password" />
			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100" style={{ minHeight: '400px' }}>
				<form className='h-100 d-flex flex-column gap-3' onSubmit={handleSubmit}>
					<InputPassword id='Current password' togglePassword={togglePassword} />
					<InputPassword id='New password' togglePassword={togglePassword} />
					<InputPassword id='Confirm password' togglePassword={togglePassword} />
					<div style={{ color: 'white' }}>Error message if any</div>
					<button type='submit' className='btn btn-outline-secondary w-100 mt-auto mb-5 mb-sm-0'>Confirm</button>
				</form>
			</Stack>
		</Container>
	);
}

export function DoubleAuth() {
	const [isSwitchOn, setIsSwitchOn] = useState(false);
	const [qrCodePath, setQrCodePath] = useState('');
	const [verifyCode, setVerifyCode] = useState('');

	async function create2FASubmit() {
		socket.emit('Create2FA', (response: any) => {
			setQrCodePath(response.otpauthUrl);
		});
	}

	async function verify2FASubmit() {
		console.log('verify 2fa');
		socket.emit('Verify2FA', verifyCode, (response: any) => {
			console.log(response);
		});
	}

	const switchActivate = () => {
		console.log('switch activate');
		setIsSwitchOn(!isSwitchOn); // Toggle switch state
	};

	const handleSetVerifyCode = (e: any) => {
		setVerifyCode(e.target.value);
	  };

	useEffect(() => {
		create2FASubmit();
	}, [isSwitchOn]);

	return (
		<Container fluid className="px-0 h-75">
			<Title title="Double Auth" />
			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100" style={{ minHeight: '400px' }}>
				<form className="h-100 d-flex flex-column gap-3">
					<Form.Check
						type="switch"
						id="double-auth-switch"
						label="Enable double auth"
						onChange={switchActivate}
						checked={isSwitchOn}
					/>
					<QRCode value={qrCodePath} />
				</form>
				<br></br>
				<form className="d-flex flex-column"  onSubmit={(e) => { e.preventDefault(); verify2FASubmit(); }}>
					<Form.Control
						size="lg"
						type="number"
						placeholder="Digit"
						pattern="[0-9]*"
						value={verifyCode}
						onChange={handleSetVerifyCode}
					/>
					<br></br>
					<button className='btn btn-primary w-100 mt-auto mb-5 mb-sm-0'>Activer 2fa</button>
				</form>
			</Stack>
		</Container>
	);
}

export function SettingMenu() {
	return (
		<Container fluid className='px-0 h-75'>
			<Title title="Setting" />
			<Stack className="col-12 col-sm-6 col-md-4 p-3 p-sm-6 gap-5 h-100" style={{ minHeight: '400px' }}>
				<Link to="changepassword" className='link-text link fs-5'>Change password </Link>
				<Link to="doubleauth" className='link-text link fs-5'>Double Authenticate </Link>
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