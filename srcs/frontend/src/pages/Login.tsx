import '../styles/Login.css'
import '../styles/index.css'
// import '../styles/customButton.css'

import githubLogo from '../assets/github.svg';
import fortytwologo from '../assets/fortytwologo.svg';
import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';

import { useState } from 'react';
import { Outlet, useOutletContext, Link } from "react-router-dom";


import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

type newUser = {
	// id: string,
	username: string,
	email: string,
	password: string
}

type login = {
	// id: string,
	username: string,
	password: string
}

type loginContext = {
	handleSubmit: (e: React.FormEvent<HTMLFormElement>, user: newUser | login, setErr: React.Dispatch<React.SetStateAction<string>>) => void,
	togglePassword: () => void,
}

export function Login() {

	const saveToken = (data: any) => {
		const checkbox = document.getElementById("remember me") as HTMLInputElement;

		if (checkbox && checkbox.checked) {
			localStorage.setItem('token', data.token);
		} else {
			 sessionStorage.setItem('token', data.token);
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
			body: JSON.stringify({'user': user})
		}
		
		try {
			let response = await fetch(url, fetchObj)
			if (!response.ok) { throw Error('response not ok');}
			data = await response.json();
			console.log(data);
		} catch (err: any) {
			console.log(err);
		} finally {
			('error' in data) && dealError(data, setErr);
			('token' in data) && saveToken(data);
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
		<div className='scrollbar'>
			<Container>
				<Row className="justify-content-center">
					<Col sm="6" lg="4" >
						<Link to={'..'} style={{ display: "inline-block" }}>
							<button className="leftArrow my-4"></button>
						</Link>
						<Form className="w-100" onSubmit={(e) => (
							handleSubmit(e, {username: nick, email: email, password: pass }, setErr))}>
							<h3 style={{ color: "white" }}>New Account!</h3>

							<Form.Group className="my-4" controlId="nickname">
								<Form.Label>Nickname</Form.Label>
								<Form.Control required type="text" placeholder="nickname"
									value={nick} onChange={(e) => { setNick(e.target.value) }} />
							</Form.Group>

							<Form.Group className="mb-4" controlId="email address">
								<Form.Label>Email address</Form.Label>
								<Form.Control required type="email" placeholder="email"
									value={email} onChange={(e) => { setEmail(e.target.value) }} />
							</Form.Group>

							<Form.Group className="mb-4" controlId="password">
								<Form.Label>Password</Form.Label>
								<Form.Control required type="password" placeholder="password"
									value={pass} onChange={(e) => { setPass(e.target.value) }} />
								<div className="d-flex justify-content-end">
									<img
										id="eye"
										src={eyeopen}
										onClick={togglePassword}
										className="ms-5 togglePassword" />
								</div>
							</Form.Group>
							<div id='error-message' style={{color: 'white'}}>
								{err}
							</div>
							<Form.Group className="mb-4" controlId="accept terms">
								<Form.Check required type="checkbox" label="I accept terms and conditions" />
							</Form.Group>

							<button type="submit" className="btn btn-secondary w-100" >
								Sign up
							</button>
						</Form>
					</Col>
				</Row>
			</Container>
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
		<div className='scrollbar'>
			<Container >
				<Row className="justify-content-center">
					<Col sm="6" lg="4" >
						<Link to={'..'} style={{ display: "inline-block" }}>
							<button className="leftArrow my-4"></button>
						</Link>
						<Form className="w-100" onSubmit={(e) => (handleSubmit(e, {username: nick, password: pass }, setErr))}>
							<h3 style={{ color: "white" }}>Welcome back!</h3>

							<Form.Group className="my-4" controlId="nickname">
								<Form.Label>Nickname</Form.Label>
								<Form.Control required type="text" placeholder="nickname"
									value={nick} onChange={(e) => setNick(e.target.value)} />
							</Form.Group>

							<Form.Group className="mb-4" controlId="password">
								<Form.Label>Password</Form.Label>
								<Form.Control required type="password" placeholder="password"
									value={pass} onChange={(e) => setPass(e.target.value)} />
								<div className="d-flex justify-content-end">
									<img
										id="eye"
										src={eyeopen}
										onClick={togglePassword}
										className="ms-5 togglePassword" />
								</div>
							</Form.Group>
							<div id='error-message' style={{color: 'white'}}>
								{err}
							</div>

							<Form.Group className="mb-4" controlId="remember me">
								<Form.Check type="checkbox" label="Remember me"
									checked={check == 'true'}
									onChange={(e) => setCheck(e.target.checked ? 'true' : 'false')} />
							</Form.Group>
							
							<button type="submit" className="btn btn-primary w-100">
								Login
							</button>
						</Form>
						<button className="btn btn-invisible w-100">
							Forget password
						</button>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

/* landing page */

export function LandingPage() {

	const oauth42 = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0603e43ba720c50d6f926cd41d47911dd939318f04cdb009af4c8ff655c662cd&redirect_uri=http%3A%2F%2Flocalhost%2Fauth%2F42%2Fcallback2&response_type=code";

	const github = "https://github.com/AntoineA67/ft_transcendence";

	return (
		<div className='scrollbar'>
			<Container className="text-center" style={{ height: "650px" }}>
				<Row className="justify-content-center h-100">
					<Col sm="6" lg="4">
						<div className="h-75 d-flex flex-column justify-content-evenly mt-5">
							<div className="pt-9 w-75 align-self-center">
								<h2 style={{ color: "#fa34c3", fontSize: "40px" }}><b>Ping Pang Pong</b></h2>
								<p style={{
									color: "white",
								}}>
									Si vous avez des amis, vous pouvez jouer à ce jeu en multi joueur, sinon, une IA va se charger de vous !
								</p>
							</div>
							<div className="mt-5 d-flex flex-column gap-3 justify-content-center align-items-center" style={{ position: "relative", top: "30px" }}>
								<Link to={'signin'} className="w-75 link-text">
									<button className="btn btn-primary w-100"><b>Login</b></button>
								</Link>
								<Link to={'signup'} className="w-75 link-text">
									<button className="btn btn-outline-primary w-100"><b>Signup</b></button>
								</Link>
								<a href={oauth42} className="btn-invisible w-75">
									<span>Sign in with</span>
									<img style={{ marginLeft: "10px", height: "30px" }} src={fortytwologo} />
								</a>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
			<footer className="d-flex flex-column align-items-center" style={{ color: "grey" }}>
				Projet de fin de tronc-commun de l’école 42
				<a href={github}><img src={githubLogo} /></a>
			</footer>
		</div>
	);
};

