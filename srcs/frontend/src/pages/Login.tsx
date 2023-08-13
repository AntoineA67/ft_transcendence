import '../styles/index.css'
import '../styles/Login.css'
// import '../styles/customButton.css'

import githubLogo from '../assets/github.svg';
import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';

import { useState } from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

type newUser = {
	id: string,
	nickname: string,
	email: string,
	password: string
}

type login = {
	id: string,
	nickname: string,
	password: string
}

function Login() {
	const [page, setPage] = useState<string>('landing');

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>, user: newUser | login, url = '') {
		e.preventDefault();
		const fetchObj = {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(user)
		}
		try {
			const response = await fetch(url, fetchObj)
			if (!response.ok) throw Error('response not ok');
		} catch (err: any) {
			console.log(err);
		} finally {
			console.log('do something here...');
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
		// <body> cannot appear as a child of <div>.
		<>
			{page == 'landing' && <LandingPage 
				handleSignin={() => setPage('signin')}
				handleSignup={() => setPage('signup')} />}
			{page === 'signin' && <Signin 
				handleLanding={() => setPage('landing')}
				togglePassword={togglePassword}
				handleSubmit={handleSubmit} />}
			{page === 'signup' && <Signup 
				handleLanding={() => setPage('landing')}
				togglePassword={togglePassword}
				handleSubmit={handleSubmit} />}
		</>
	);
}

/* sign up page */

type signupProps = {
	handleLanding: () => void,
	togglePassword: () => void,
	handleSubmit: (e: React.FormEvent<HTMLFormElement>, user: newUser | login) => Promise<void>
}

function Signup({ handleLanding, togglePassword, handleSubmit }: signupProps) {	
	const [nick, setNick] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [pass, setPass] = useState<string>('');

	return (
		<Container>
			<Row className="justify-content-center">
				<Col sm="6" lg="4" >
					<button 
						className="leftArrow my-4"
						onClick={handleLanding} />
					<Form className="w-100" onSubmit={(e) => (
						handleSubmit(e, {id: nick, nickname: nick, email: email, password: pass}))}>
						<h3 style={{ color: "white" }}>New Account!</h3>
						
						<Form.Group className="my-4" controlId="nickname">
							<Form.Label>Nickname</Form.Label>
							<Form.Control required type="text" placeholder="nickname" 
								value={nick} onChange={(e) => {setNick(e.target.value)}}/>
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
									className="ms-5"
									style={{
										cursor: "pointer",
										position: "relative",
										bottom: "30px",
										right: "20px"
									}} />
							</div>
						</Form.Group>

						<Form.Group className="mb-4" controlId="accept terms">
							<Form.Check required type="checkbox" label="I accept terms and conditions"/>
						</Form.Group>
						
						<button type="submit" className="btn btn-secondary w-100" >
							Sign up
						</button>
					</Form>	
				</Col>
			</Row>
		</Container>
	)
}

/* sign in page */

type signinProps = {
	handleLanding: () => void,
	togglePassword: () => void,
	handleSubmit: (e: React.FormEvent<HTMLFormElement>, user: newUser | login) => Promise<void>
}

function Signin({ handleLanding, togglePassword, handleSubmit }: signinProps) {
	const [nick, setNick] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	
	return (
		<Container>
			<Row className="justify-content-center">
				<Col sm="6" lg="4" >
					<button
						className="leftArrow my-4"
						onClick={handleLanding} />
					<Form className="w-100" onSubmit={(e) => (
						handleSubmit(e, {id: nick, nickname: nick, password: pass}))}>
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
									className="ms-5"
									style={{
										cursor: "pointer",
										position: "relative",
										bottom: "30px",
										right: "20px"
									}} />
							</div>
						</Form.Group>

						<Form.Group className="mb-4" controlId="remember me">
							<Form.Check type="checkbox" label="Remember me" />
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
	);
}

/* landing page */

type landingPageProps = {
	handleSignin: () => void,
	handleSignup: () => void,
}

function LandingPage({ handleSignin, handleSignup }: landingPageProps) {
	
	const oauth42 = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0603e43ba720c50d6f926cd41d47911dd939318f04cdb009af4c8ff655c662cd&redirect_uri=http%3A%2F%2Flocalhost%2Fauth%2F42%2Fcallback2&response_type=code";

	const github = "https://github.com/AntoineA67/ft_transcendence";

	return (
		<>
		<Container className="text-center" style={{height: "650px"}}>
			<Row className="justify-content-center h-100 landingBg">
				<Col sm="6" lg="4">
					<div className="h-75 d-flex flex-column justify-content-evenly mt-5">
						<div className="pt-5 w-75 align-self-center">
							<h2 style={{color: "white"}}>Ping Pang Pong</h2>
							<p style={{ color: "gray" }}>
								Si vous avez des amis, vous pouvez jouer à 
								ce jeu en multi joueur, sinon, une IA va se
								charger de vous !
							</p>
						</div>
						<div className="mt-5 d-flex flex-column gap-3 
							justify-content-center align-items-center "
							style={{position: "relative", top: "30px"}}>
							<button
								onClick={handleSignin}
								className="btn btn-primary w-75">
								Login
							</button>
							<button
								onClick={handleSignup}
								className="btn btn-outline-primary w-75">
								Sign up
							</button>
							<a href={oauth42} className="btn-invisible w-75">
								Sign in with 42
							</a>
						</div>		
					</div>
				</Col>
			</Row>	
		</Container>
		<footer className="d-flex flex-column align-items-center"
			style={{color: "grey"}}>
			Projet de fin de tronc-commun de l’école 42
			<a href={github}><img src={githubLogo} /></a>
		</footer>
		</>
	);
}


export default Login;