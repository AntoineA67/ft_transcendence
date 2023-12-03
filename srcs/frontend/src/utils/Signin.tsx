import { useOutletContext, Link } from "react-router-dom";
import { useState } from 'react';
import eyeopen from '../assets/eyeopen.svg';

type newUser = {
	username: string,
	email: string,
	password: string
}

type login = {
	email: string,
	password: string,
	token2FA?: string,
}

type loginContext = {
	handleSubmit: (e: React.FormEvent<HTMLFormElement>,
		user: newUser | login,
		setErr: React.Dispatch<React.SetStateAction<string>>,
		set2FA: React.Dispatch<React.SetStateAction<boolean>>,) => void,
	togglePassword: () => void,
}

/* sign in page */

export function Signin() {
	const { togglePassword, handleSubmit } = useOutletContext<loginContext>();

	const [email, setEmail] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	const [_2fa, set2FA] = useState<boolean>(false);
	const [twoFACode, setTwoFACode] = useState<string>('');
	const [err, setErr] = useState('');

	return (
		<div className='container'>
			<div className="row justify-content-center">
				<div className='col-sm-6 col-lg-4'>
					{/* sm="6" lg="4" */}
					<Link to='..'>
						<button className="leftArrow my-4"></button>
					</Link>
					<form className="w-100" onSubmit={(e) => { (handleSubmit(e, { email: email, password: pass, token2FA: twoFACode }, setErr, set2FA)) }}>
						<h3 className='white-text'>Welcome back!</h3>

						<div className="mt-4">
							<label htmlFor='email'>Email</label>
							<input id='email' required type="text" placeholder="email"
								value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>

						<div className="mt-4">
							<label htmlFor='password'>Password</label>
							<input id='password' required type="password" placeholder="password"
								value={pass} onChange={(e) => setPass(e.target.value)} />
							<div className="d-flex justify-content-end">
								<img
									id="eye"
									src={eyeopen}
									onClick={togglePassword}
									alt="toggle password"
									className="togglePassword" />
							</div>
						</div>

						{_2fa === true && <div className="mt-4">
							<label htmlFor='twoFACode'>Two factor authentication code</label>
							<input id='twoFACode' required type="text" placeholder="twoFACode"
								value={twoFACode} onChange={
									(e) => setTwoFACode(e.target.value)} />
						</div>}

						<div id='error-message' className='red-text mt-4'>
							{err}
						</div>

						<button type="submit" className="btn btn-primary w-100">
							Login
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}