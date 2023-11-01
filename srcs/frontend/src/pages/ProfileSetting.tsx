import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import '../styles/index.css'

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
import axios from 'axios';
import { set } from 'lodash-es';

export function Title({ title }: { title: string }) {
	return (
		<div className='d-flex w-100 align-items-center bg-black'>
			<Link to="/me"><button className='leftArrow m-2'></button></Link>
			<h4 className='white-text' >{title}</h4>
		</div>
	);
}

export function TwoFactorAuth() {
	const navigate = useNavigate();
	const [invalidToken, setInvalidToken] = useState(false);
	const [qrCodePath, setQrCodePath] = useState('');
	const [token, setToken] = useState('');
	const [profile, setProfile] = useState<profileType | null>(null);

	async function create2FASubmit() {
		socket.emit('Create2FA', (response: any) => {
			setQrCodePath(response.otpauthUrl);
		});
	}

	async function verify2FASubmit() {
		if (profile!.activated2FA === false) {
			socket.emit('Activate2FA', token, (response: any) => {
				console.log(response);
				if (response == true) {
					navigate("/me/setting/");
				} else {
					setInvalidToken(true);
				}
			});
		} else {
			socket.emit('Disable2FA', token, (response: any) => {
				console.log(response);
				if (response == true) {
					navigate("/me/setting/");
				} else {
					setInvalidToken(true);
				}
			});
		}

	}

	useEffect(() => {
		if (!profile) {
			socket.emit('MyProfile', profile, (res: profileType) => {
				setProfile(res);
				if (res.activated2FA === false) {
					create2FASubmit();
				}
			});
		}
	}, [profile]);

	return (
		<Container fluid className="px-0 h-75">
			<Title title="Two-factor authentication" />
			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100 m-auto" >
				<form className="d-flex flex-column gap-3">
					<div className='white-text mx-auto my-0'>
						{profile! && (
							profile.activated2FA === false && (
								<>
									<h3>Enable two-factor authentication</h3>
									<p>
										To enable two-factor authentication, scan the QR code below with a 2FA app.
									</p>
								</>
							)
						)}
						{profile! && (
							profile.activated2FA === true && (
								<>
									<h3>Disable two-factor authentication</h3>
									<p>
										Enter the 6-digit code from your 2FA app to disable two-factor authentication.
									</p>
								</>
							)
						)}
					</div>
					{profile! && (
						profile.activated2FA === false && (
							<>
								<div className='m-auto'>
									<QRCode value={qrCodePath} />
								</div>
								<div className='white-text'>
									<p>
										Enter the 6-digit code from your 2FA app to confirm its authenticity.
									</p>
								</div>
							</>
						)
					)}
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
							<div className='red-text text-center'>Your token is invalid, please try again !</div>
							<br></br>
						</>
					)}
					<button className='btn btn-primary w-100 mt-auto mb-5 mb-sm-0' disabled={invalidToken === true}>{profile?.activated2FA ? "Disable" : "Activate"}</button>
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
			style={{ letterSpacing: "10px" }}
			className="text-center overflow-hidden d-flex "
		/>
	);
};


export function SettingMenu() {

	const [profile, setProfile] = useState<profileType | null>(null);
	const [oldPassword, setOldPassword] = useState<String>('');
	const [newPassword, setNewPassword] = useState<String>('');
	const [confirmPassword, setConfirmPassword] = useState<String>('');
	const [err, setErr] = useState<String>('');
	const navigate = useNavigate();

	useEffect(() => {
		if (!profile) {
			socket.emit('MyProfile', profile, (res: profileType) => {
				setProfile(res);
			});
		}
	}, [profile]);

	const handleChange = (event: any, type: string) => {
		setErr('');
		switch (type) {
			case 'oldPassword':
				setOldPassword(event.target.value);
				break;
			case 'newPassword':
				setNewPassword(event.target.value);
				break;
			case 'confirmPassword':
				setConfirmPassword(event.target.value);
				break;
			default:
				break;
		}
	};

	const handleLogout = () => {
		try {
			axios.post(process.env.REACT_APP_BACKEND_URL + "/auth/signout", {
				refreshToken: localStorage.getItem('refreshToken'),
			}, {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
			});
			['token', 'random', 'email', 'refreshToken'].forEach(item => localStorage.removeItem(item));
			window.location.href = '/';
		} catch (err: any) {
			console.log(err);
		}
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setErr('New password and confirm password does not match');
			return;
		}
		console.log('handle submit: change password');

		socket.emit('ChangePassword', { newPassword, oldPassword }, (res: any) => {
			console.log('res ->');
			console.log(res);
		});
	};

	const switchActivate = () => {
		navigate("/me/setting/2fa");
	};

	return (
		<div className='container-fluid px-0 h-75'>
			<Title title="Setting" />
			<Stack className="col-12 col-sm-6 col-md-5 p-3 p-sm-5 h-100 m-auto" >
				{profile?.password && (
					<form className='h-100 d-flex flex-column gap-3' onSubmit={handleSubmit}>
						<div>
							<label htmlFor='current-password'>Current password</label>
							<input id='current-password' type="password" placeholder="Current password" onChange={(e) => handleChange(e, 'oldPassword')} />
						</div>
						<div>
							<label htmlFor='new-password'>New password</label>
							<input id='new-password' type="password" placeholder="New password" onChange={(e) => handleChange(e, 'newPassword')} />
						</div>
						<div>
							<label htmlFor='confirm-password'>Confirm password</label>
							<input id='confirm-password' type="password" placeholder="Password" onChange={(e) => handleChange(e, 'confirmPassword')} />
						</div>
						{err !== '' && (
							<div className='red-text'>{err}</div>
						)}
						<button type='submit' className='btn btn-outline-secondary w-100' >Confirm</button>
					</form>
				)}

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
				<button onClick={() => { handleLogout() }}
					className='btn btn-outline-secondary w-100 mt-auto mb-5'>Log out</button>

			</Stack>
		</div>
	);
}

export function Setting() {
	return (
		<Outlet />
	)
}