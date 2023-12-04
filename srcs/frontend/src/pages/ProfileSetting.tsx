import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import { Link, Outlet, useNavigate, useLoaderData } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { profileType } from '../../types/user';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { checkPassword } from './ChatDto';
import { friendsSocket, chatsSocket, gamesSocket, socket } from '../utils/socket';

export function Title({ title }: { title: string }) {
	return (
		<div className='d-flex w-100 align-items-center bg-black'>
			<Link to=".."><button className='leftArrow m-2'></button></Link>
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
			if (response)
				setQrCodePath(response.otpauthUrl);
		});
	}

	async function verify2FASubmit() {
		if (profile!.activated2FA === false) {
			socket.emit('Activate2FA', token, (response: any) => {
				if (response == true) {
					navigate("/me/setting/");
				} else {
					setInvalidToken(true);
				}
			});
		} else {
			socket.emit('Disable2FA', token, (response: any) => {
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

	const [profile, setProfile] = useState<profileType>(useLoaderData() as profileType);
	const [oldPassword, setOldPassword] = useState<string>('');
	const [newPassword, setNewPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [err, setErr] = useState<string>('');
	const [success, setSuccess] = useState<string>('');
	const [formSubmitted, setFormSubmitted] = useState(false);
	const navigate = useNavigate();


	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
		setErr('');
		setSuccess('');
		const inputValue = e.target.value;

		if (inputValue.length > 0)
			setFormSubmitted(false);
		if (inputValue.length > 20) {
			setErr('Characters limits is 20.');
		} else {
			switch (type) {
				case 'oldPassword':
					setOldPassword(inputValue);
					break;
				case 'newPassword':
					setNewPassword(inputValue);
					break;
				case 'confirmPassword':
					setConfirmPassword(inputValue);
					break;
				default:
					break;
			}
		}
	};


	const handleLogout = async () => {
		try {
			await axios.post(process.env.REACT_APP_BACKEND_URL + "/auth/signout", {
				refreshToken: localStorage.getItem('refreshToken'),
			}, {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
			});
			['token', 'random', 'email', 'refreshToken', 'firstConnexion'].forEach(item => localStorage.removeItem(item));
			window.location.href = '/';
			socket.disconnect()
			friendsSocket.disconnect()
			chatsSocket.disconnect()
			gamesSocket.disconnect()
		} catch (err: any) {
		}
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setErr('New password and confirm password do not match');
			return;
		}
		if (!checkPassword(newPassword, enqueueSnackbar))
			return;
		socket.emit('ChangePassword', { newPassword, oldPassword }, (res: any) => {
			if (res === true) {
				setSuccess('Password changed successfully!');
				setOldPassword('');
				setNewPassword('');
				setConfirmPassword('');
				setFormSubmitted(true);
			} else {
				setErr('Wrong password !');
			}
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
							<input
								id='current-password'
								type="password"
								placeholder="Current password"
								onChange={(e) => handleChange(e, 'oldPassword')}
								maxLength={20}
								value={formSubmitted ? '' : oldPassword}
							/>
						</div>
						<div>
							<label htmlFor='new-password'>New password</label>
							<input
								id='new-password'
								type="password"
								placeholder="New password"
								onChange={(e) => handleChange(e, 'newPassword')}
								maxLength={20}
								value={formSubmitted ? '' : newPassword}
							/>
						</div>
						<div>
							<label htmlFor='confirm-password'>Confirm password</label>
							<input
								id='confirm-password'
								type="password"
								placeholder="Password"
								onChange={(e) => handleChange(e, 'confirmPassword')}
								maxLength={20}
								value={formSubmitted ? '' : confirmPassword}
							/>
						</div>

						{err !== '' && (
							<div className='red-text'>{err}</div>
						)}
						{success !== '' && (
							<div className='green-text'>{success}</div>
						)}
						<button
							type='submit'
							className='btn btn-outline-secondary w-100'
							disabled={!oldPassword || !newPassword || !confirmPassword}
						>
							Confirm
						</button>
					</form>
				)}

				<hr />
				<Form.Check
					type="switch"
					id="double-auth-switch"
					label={profile?.activated2FA ? "Disable two-factor authentication" : "Enable two-factor authentication"}
					onChange={switchActivate}
					checked={profile.activated2FA}
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