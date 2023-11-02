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
		set2FA: React.Dispatch<React.SetStateAction<boolean>>, ) => void,
	togglePassword: () => void,
}

/* sign in page */

export function Signin() {
	const { togglePassword, handleSubmit } = useOutletContext<loginContext>();

	const [email, setEmail] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	const [check, setCheck] = useState<string>('true');
	const [_2fa, set2FA] = useState<boolean>(false);
	const [twoFACode, setTwoFACode] = useState<string>('');
	const [err, setErr] = useState('');

	// async function sendToken() {
	// 	localStorage.setItem('_2fa', JSON.stringify({ id: _2fa.id, token: token, activated: _2fa.activated })); // set access token and refresh token
	// 	const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/auth/_2fa/id=${_2fa.id}&token=${token}`);
	// 	const data = await response.json();
	// 	if (data._2fa === 'success') {
	// 		window.location.href = oauth42Url;
	// 	} else {
	// 		setInvalidToken(true);
	// 	}
	// }
	
	return (
		<div className='container'>
			<div className="row justify-content-center">
				<div className='col-sm-6 col-lg-4'>
					{/* sm="6" lg="4" */}
					<Link to='..'>
						<button className="leftArrow my-4"></button>
					</Link>
					<form className="w-100" onSubmit={(e) => {console.log(twoFACode); (handleSubmit(e, { email: email, password: pass, token2FA: twoFACode }, setErr, set2FA))}}>
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
									className="togglePassword" />
							</div>
						</div>
						
						<div className="mt-4">
							<input type="checkbox" id="remember me" className='d-inline w-auto'
								checked={check === 'true'}
								onChange={(e) => setCheck(e.target.checked ? 'true' : 'false')} />
							<label htmlFor="remember me" className='d-inline ms-3'>Remember me</label>
						</div>

						{_2fa == true && <div className="mt-4">
							<label htmlFor='twoFACode'>Two factor authentication code</label>
							<input id='twoFACode' required type="text" placeholder="twoFACode"
								value={twoFACode} onChange={
									(e) => setTwoFACode(e.target.value)}/>
						</div>}

						{/* {_2fa == true && <div id='_2fa' className='red-text mt-4'>
							coucou : { _2fa.toString() }
						</div>} */}
						
						<div id='error-message' className='red-text mt-4'>
							{err}
						</div>

						<button type="submit" className="btn btn-primary w-100">
							Login
						</button>
					</form>
					<button className="btn btn-invisible w-100">
						Forget password
					</button>
				</div>
			</div>
		</div>
	);
}