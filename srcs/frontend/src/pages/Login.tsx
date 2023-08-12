import '../styles/index.css'
import '../styles/Login.css'
import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
// import '../styles/customButton.css'
import bg from '../assets/landingBg.png';
import githubLogo from '../assets/github.svg';
import { useState } from 'react';
import LeftArrow from '../utils/LeftArrow';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



function Login() {
	const [page, setPage] = useState<string>('landing');
	
	const gotoSignin = () => {
		setPage('signin');
	}
	const gotoSignup = () => {
		setPage('signup');
	}
	// const goto42 = () => {
	// 	setPage('')
	// }
	const goToLanding = () => {
		setPage('landing');
	}
	
	return (
		<body>
			{page == 'landing' && <LandingPage 
				click1={gotoSignin}
				click2={gotoSignup}
				// click3={handleClick42}
				/>}
			{page === 'signin' && <Signin
				setPage={setPage}
			></Signin>}
			{page === 'signup' && <Signup
				setPage={setPage}
			></Signup>}
		</body>
	);
}

/* sign up page */


type signupProps = {
	setPage: React.Dispatch<React.SetStateAction<string>>,
}

function Signup({setPage}: signupProps) {
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
		<Container>
			<Row className="justify-content-center">
				<Col sm="6" lg="4" >
					<Form className="w-100">
						<div className="my-4">
							<LeftArrow setPage={setPage} goToPage={'landing'} />
						</div>
						<h3 style={{ color: "white" }}>New Account!</h3>
						
						<Form.Group className="my-4" controlId="nickname">
							<Form.Label>Nickname</Form.Label>
							<Form.Control required type="text" placeholder="nickname" />
						</Form.Group>

						<Form.Group className="mb-4" controlId="email address">
							<Form.Label>Email address</Form.Label>
							<Form.Control required type="email" placeholder="email" />
						</Form.Group>

						<Form.Group className="mb-4" controlId="password">
							<Form.Label>Password</Form.Label>
							<Form.Control required type="password" placeholder="password" />
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
							<Form.Check type="checkbox" label="I accept terms and conditions" />
						</Form.Group>
						
						<button type="submit" className="btn btn-secondary w-100">
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
	setPage: React.Dispatch<React.SetStateAction<string>>,
}

function Signin({ setPage }: signinProps) {
	return (
		<div>
			<LeftArrow
				setPage={setPage}
				goToPage={'landing'}
			></LeftArrow>
			<h1>signup</h1>
		</div>
	)
}

/* landing page */

type landingPageProps = {
	click1: () => void,
	click2: () => void,
}

function LandingPage({click1, click2}: landingPageProps) {
	
	return (
		<div className="landingPage">
			<Container className="text-center" >
				<Row className="pb-0">
					<h2>Ping Pang Pong</h2>
					<p style={{ color: "gray" }}>
						Si vous avez des amis, vous pouvez jouer à <br />
						ce jeu en multi joueur, sinon, une IA va se <br />
						charger de vous !
					</p>
				</Row>
					
				<div className="d-flex flex-column gap-3 
					justify-content-center align-items-center "
					style={{position: "relative", top: "30px"}}>
					<button
						onClick={click1}
						className="btn btn-primary">
						Login
					</button>
					<button
						onClick={click2}
						className="btn btn-outline-primary">
						Sign up
					</button>
					<button
						// onClick={click3}
						className="btn-invisible">
						Sign in with 42
					</button>
				</div>		
			</Container>

			<footer className="footer">
				Projet de fin de tronc-commun de l’école 42<br />
				<a href="#"><img src={githubLogo} /></a>
			</footer>
		</div>
	);
}


export default Login;