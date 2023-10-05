import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
//import Form from 'react-bootstrap/Form';
import Form from 'react-bootstrap/Form';
import { socket } from '../utils/socket';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { profileType } from '../../types/user';
import { Alert } from 'react-bootstrap';


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
	const [token, setToken] = useState('');
	const [invalidToken, setInvalidToken] = useState(false);
	const navigate = useNavigate();

	async function create2FASubmit() {
		socket.emit('Create2FA', (response: any) => {
			setQrCodePath(response.otpauthUrl);
		});
	}

	async function verify2FASubmit() {
		socket.emit('Verify2FA', token, (response: any) => {
			console.log(response);
			if (response == true) {
				navigate("/setting/");
			} else {
				setInvalidToken(true);
			}
		});
	}

	useEffect(() => {
		create2FASubmit();
	}, [isSwitchOn]);

	return (
		<Container fluid className="px-0 h-75">
			<Title title="Double Auth" />
			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100 m-auto" style={{ minHeight: '400px' }}>
				<form className="h-100 d-flex flex-column gap-3">
					<div style={{ color: "white", margin: "auto 0" }}>
						<h3>Enable two-factor authentication</h3>
						<p>
							To enable two-factor authentication, scan the QR code below with a 2FA app.
						</p>
					</div>
					<div style={{ margin: "auto" }}>
						<QRCode value={qrCodePath} />
					</div>
					<div style={{ color: "white" }}>
						<p>
							Enter the 6-digit code from your 2FA app to confirm its authenticity.
						</p>
					</div>
				</form>
				<br></br>
				<form className="d-flex flex-column" onSubmit={(e) => { e.preventDefault(); verify2FASubmit(); }}>
					<InputToken
						handleChange={(token: any) => {
							setToken(token);
							setInvalidToken(false);
						}}
					/>
					<br></br>
					{invalidToken === true && (
						<>
							<div style={{ color: 'red', textAlign: 'center' }}>Your token is invalid, please try again !</div>
							<br></br>
						</>
					)}
					<button className='btn btn-primary w-100 mt-auto mb-5 mb-sm-0' disabled={invalidToken === true}>Activate</button>
				</form>
			</Stack>
		</Container>
	);
}

export const InputToken = ({ handleChange }: any) => {
	const [value, setValue] = useState("");

	const handleChangeToken = (event: any) => {
		const newValue = event.target.value;
		if (newValue.length <= 6) {
			setValue(newValue);
			handleChange(newValue);
		}
	};
	return (
		<Form.Control
			size="lg"
			type="number"
			pattern="[0-9]*"
			value={value}
			onChange={handleChangeToken}
			style={{ overflow: "hidden", letterSpacing: "10px", display: 'flex' }}
			className="text-center"
		/>
	);
};


export function SettingMenu() {

	const [profile, setProfile] = useState<profileType | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (!profile) {
			console.log("emit");
			socket.emit('MyProfile', profile, (res: profileType) => {
				setProfile(res);
				console.log("profile", res);
			});
		}
	}, [profile]);


	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		console.log('handle submit: change password');
	};

	const switchActivate = () => {
		navigate("/setting/doubleauth");
	};


	return (
		<Container fluid className='px-0 h-75'>
			<Title title="Setting" />

			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100 m-auto" style={{ minHeight: '400px' }}>

				<Form className='h-100 d-flex flex-column gap-3' onSubmit={handleSubmit}>
					<Form.Group controlId="currentPassword" >
						<Form.Label>Confirm password</Form.Label>
						<Form.Control type="password" placeholder="Current password" disabled={profile?.password === 'nopass'} />
					</Form.Group>
					<Form.Group controlId="newPassword" >
						<Form.Label>New password</Form.Label>
						<Form.Control type="password" placeholder="New password" disabled={profile?.password === 'nopass'} />
					</Form.Group>
					<Form.Group controlId="confirmPassword" >
						<Form.Label>Confirm password</Form.Label>
						<Form.Control type="password" placeholder="Password" disabled={profile?.password === 'nopass'} />
					</Form.Group>
					{profile?.password === 'nopass' && (
						<div style={{ color: 'red' }}>You cannot change the password because you are connected with the 42 school API</div>
					)}
					<button type='submit' className='btn btn-outline-secondary w-100' disabled={profile?.password === 'nopass'} >Confirm</button>
				</Form>

				<hr />

				<Form.Check
					type="switch"
					id="double-auth-switch"
					label={profile?.activated2FA ? "Disable two-factor authentication" : "Enable two-factor authentication"}
					onChange={switchActivate}
					checked={profile?.activated2FA}
				/>

				<hr />
				<br></br>
				<button onClick={() => {
					localStorage.removeItem('token');
					window.location.href = '/';
				}} className='btn btn-outline-secondary w-100 mt-auto mb-5 mb-sm-0'>Log out</button>

			</Stack>

		</Container>
	);
}

export function Setting() {
	return (
		<Outlet />
	)
}