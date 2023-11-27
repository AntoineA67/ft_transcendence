import { useOutletContext, Link } from "react-router-dom";
import { useState } from 'react';
import { validatePassword, validateUsername } from "./CredentialsRegex";
import eyeopen from '../assets/eyeopen.svg';

type newUser = {
	username: string,
	email: string,
	password: string
}

type login = {
	email: string,
	password: string
}

type loginContext = {
	handleSubmit: (e: React.FormEvent<HTMLFormElement>, user: newUser | login, setErr: React.Dispatch<React.SetStateAction<string>>) => void,
	togglePassword: () => void,
}

/* sign up page */

export function Signup() {
	const { togglePassword, handleSubmit } = useOutletContext<loginContext>();

	const [nick, setNick] = useState('');
	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const [err, setErr] = useState('');

	return (
		<div className='container'>
			<div className="row justify-content-center">
				<div className='col-sm-6 col-lg-4'>
					{/* sm="6" lg="4" */}
					<Link to="..">
						<button className="leftArrow my-4"></button>
					</Link>
					<form className="w-100" onSubmit={(e) => {
						e.preventDefault();

						const passwordValidationError = validatePassword(pass);
						if (passwordValidationError) {
							setErr(passwordValidationError);
							return;
						}

						const usernameValidationError = validateUsername(nick);
						if (usernameValidationError) {
							setErr(usernameValidationError);
							return;
						}

						handleSubmit(e, { username: nick, email: email, password: pass }, setErr);
					}}>
						<h3 className='white-text'>New Account!</h3>

						<div className="mt-4">
							<label htmlFor='nickname'>Nickname</label>
							<input id='nickname' required type="text" placeholder="nickname"
								value={nick} onChange={(e) => { setNick(e.target.value) }} />
						</div>

						<div className="mt-4">
							<label htmlFor='email'>Email address</label>
							<input id='email' required type="email" placeholder="email"
								value={email} onChange={(e) => { setEmail(e.target.value) }} />
						</div>

						<div className="mt-4">
							<label htmlFor='password'>Password</label>
							<input id='password' required type="password" placeholder="password"
								value={pass} onChange={(e) => { setPass(e.target.value) }} />
							<div className="d-flex justify-content-end">
								<img
									id="eye"
									src={eyeopen}
									onClick={togglePassword}
									alt="eye"
									className="togglePassword" />
							</div>
						</div>
						<div id='error-message' className='red-text'>
							{err}
						</div>

						<button type="submit" className="btn btn-secondary w-100 mt-4" >
							Sign up
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}