
import githubLogo from '../assets/github.svg';
import fortytwologo from '../assets/fortytwologo.svg';
import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';

import { useState, useEffect, useContext } from 'react';
import { Outlet, useOutletContext, Link, Navigate } from "react-router-dom";

import Form from 'react-bootstrap/Form';

type newUser = {
	username: string,
	email: string,
	password: string
}

type login = {
	username: string,
	password: string
}

type loginContext = {
	handleSubmit: (e: React.FormEvent<HTMLFormElement>, user: newUser | login, setErr: React.Dispatch<React.SetStateAction<string>>) => void,
	togglePassword: () => void,
}

export function Login() {

	const saveToken = (data: any, user: newUser | login) => {
		const checkbox = document.getElementById("remember me") as HTMLInputElement;

		if (checkbox && checkbox.checked) {
			localStorage.setItem('token', data.token);
			localStorage.setItem('nick', user.username);

		} else {
			sessionStorage.setItem('token', data.token);
			sessionStorage.setItem('nick', user.username);
		}
	}

	const dealError = (data: any, setErr: React.Dispatch<React.SetStateAction<string>>) => {
		const errMess = document.getElementById("error-message") as HTMLInputElement;
		setErr(data.error);
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>,
		user: newUser | login, setErr: React.Dispatch<React.SetStateAction<string>>) {
		e.preventDefault();
		let data;
		let url = ('email' in user) ? ('http://localhost:3000/auth/signup'
		) : ('http://localhost:3000/auth/login');
		const fetchObj = {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ 'user': user })
		}

		try {
			let response = await fetch(url, fetchObj)
			if (!response.ok) { throw Error('response not ok'); }
			data = await response.json();
			console.log(data);
		} catch (err: any) {
			console.log(err);
		} finally {
			('error' in data) && dealError(data, setErr);
			('token' in data) && saveToken(data, user);
		}
	}

	const togglePassword = () => {
		let x = document.getElementById("password") as HTMLInputElement;
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
		<Outlet context={{ togglePassword, handleSubmit }} />
	);
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
					<form className="w-100" onSubmit={(e) => (
						handleSubmit(e, { username: nick, email: email, password: pass }, setErr))}>
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
									className="togglePassword" />
							</div>
						</div>
						<div id='error-message' className='white-text'>
							{err}
						</div>

						<div className="mt-4">
							<input required type="checkbox" id="accept-terms" className='d-inline w-auto'/>
							<label htmlFor="accept-terms" className='d-inline ms-3'>
								I accept terms and conditions
							</label>
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

/* sign in page */

export function Signin() {
	const { togglePassword, handleSubmit } = useOutletContext<loginContext>();

	const [nick, setNick] = useState<string>('');
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
					<form className="w-100" onSubmit={(e) => (handleSubmit(e, { username: nick, password: pass }, setErr))}>
						<h3 className='white-text'>Welcome back!</h3>

						<div className="mt-4">
							<label htmlFor='email'>Email</label>
							<input id='email' required type="text" placeholder="email"
								value={nick} onChange={(e) => setNick(e.target.value)} />
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

export function Oauth42() {
	const random = Math.random().toString(36).slice(2, 12);

	const api42 = 'https://api.intra.42.fr/oauth/authorize';
	const clientId = 'u-s4t2ud-92e9863469ae5ee4e62ea09c6434ee83527230b782782a942f3145cc1ed79b89';
	const redirectUri = 'http://localhost:8000/42/callback';
	const responseType = 'code';
	const scope = 'public';

	const oauth42 = `${api42}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${random}`;

	useEffect(() => {
		localStorage.setItem('random', random);
	}, []);

	return oauth42;
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
			style={{letterSpacing: "10px"}}
			className="text-center overflow-hidden d-flex"
		/>
	);
};

export function TokenPage() {

	const oauth42Url = Oauth42();
	const [token, setToken] = useState<string>('');
	const [invalidToken, setInvalidToken] = useState(false);
	const _2fa = JSON.parse(localStorage.getItem('_2fa') || '{}');

	async function sendToken() {
		localStorage.setItem('_2fa', JSON.stringify({ id: _2fa.id, token: token, actived: _2fa.actived }));
		const response = await fetch(`http://localhost:3000/auth/_2fa/id=${_2fa.id}&token=${token}`);
		const data = await response.json();
		if (data._2fa === 'success') {
			window.location.href = oauth42Url;
		} else {
			setInvalidToken(true);
		}
	}

	return (
		<div className='container' >
			<div className="row justify-content-center">
				<div className='col-sm-6 col-lg-6' >
					{/*  sm="6" lg="6" */}

					<div className='white-text m-0 mt-4' > {/* style={{ color: "white", margin: "60px 0 0 0" }} */}
						<h2>Two-factor authentication</h2>
						<p>
							Enter the 6-digit code from your 2FA app to pass two-factor authentication.
						</p>
					</div>
					<form className="d-flex flex-column" onSubmit={(e) => { e.preventDefault(); sendToken(); }}>
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
						<button className='btn btn-primary w-100 mt-auto mb-5 mb-sm-0' disabled={invalidToken === true}>Login</button>
					</form>

				</div>
			</div>
		</div>
	);
}

export function LandingPage() {

	const oauth42Url = Oauth42();
	const github = "https://github.com/AntoineA67/ft_transcendence";

	useEffect(() => {
		localStorage.removeItem('_2fa');
	}, []);

	return (
		<>
			<div className="conatiner text-center">
				<div className="row justify-content-center h-100">
					<div className='col-sm-6 col-lg-6'>
						<div className="h-75 d-flex flex-column justify-content-evenly ">
							<div className="w-75 align-self-center mt-5">
								<h1 className='magenta-text mt-5'><b>Ping Pang Pong</b></h1>
								<p className='white-text'>
									Si vous avez des amis, vous pouvez jouer à ce jeu en multi joueur, sinon, une IA va se charger de vous !
								</p>
							</div>
							<div className="mt-4 d-flex flex-column gap-3 justify-content-center align-items-center" >
								<Link to='signin' className="w-75">
									<button className="btn btn-primary w-100"><b>Login</b></button>
								</Link>
								<Link to='signup' className="w-75">
									<button className="btn btn-outline-primary w-100"><b>Signup</b></button>
								</Link>
								<a href={oauth42Url} >
									<span>Sign in with </span>
									<img className='ms-1 d-inline-block' style={{ height: "30px" }} src={fortytwologo} />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<footer className="d-flex flex-column align-items-center grey-text py-3">
				Projet de fin de tronc-commun de l’école 42
				<a href={github}><img src={githubLogo} /></a>
			</footer>
		</>
	);
};

