import { useOutletContext, Link } from "react-router-dom";
import { useState } from 'react';
// import githubLogo from '../assets/github.svg';
// import fortytwologo from '../assets/fortytwologo.svg';
import eyeopen from '../assets/eyeopen.svg';
// import eyeclose from '../assets/eyeclose.svg';

// import axios from 'axios';
// import Form from 'react-bootstrap/Form';

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

/* sign in page */

// import { useSearchParams } from "react-router-dom";


export function Signin() {
	const { togglePassword, handleSubmit } = useOutletContext<loginContext>();

	const [email, setEmail] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	const [check, setCheck] = useState<string>('true');
	const [err, setErr] = useState('');
	
	return (
		<div className='container'>
			<div className="row justify-content-center">
				<div className='col-sm-6 col-lg-4'>
					{/* sm="6" lg="4" */}
					<Link to='..'>
						<button className="leftArrow my-4"></button>
					</Link>
					<form className="w-100" onSubmit={(e) => (handleSubmit(e, { email: email, password: pass }, setErr))}>
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
								checked={check == 'true'}
								onChange={(e) => setCheck(e.target.checked ? 'true' : 'false')} />
							<label htmlFor="remember me" className='d-inline ms-3'>Remember me</label>
						</div>
						
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