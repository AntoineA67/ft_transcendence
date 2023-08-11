import '../styles/Login.css'
import '../styles/customButton.css'
import bg from '../assets/landingBg.png';
import githubLogo from '../assets/github.svg';
import { useState } from 'react';
import LeftArrow from '../utils/LeftArrow';

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
		<>
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
		</>
	);
}

type signupProps = {
	setPage: React.Dispatch<React.SetStateAction<string>>,
}

function Signup({setPage}: signupProps) {
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

type landingPageProps = {
	click1: () => void,
	click2: () => void,
}

function LandingPage({click1, click2}: landingPageProps) {
	
	return (
		<div className="landingPage">
			<Container className="text center">
				<Row style={{ position: "relative", bottom: "70px" }}>
					<h2>Ping Pang Pong</h2>
					<p style={{ color: "gray" }}>
						Si vous avez des amis, vous pouvez jouer à <br />
						ce jeu en multi joueur, sinon, une IA va se <br />
						charger de vous !
					</p>
				</Row>
					
				<div className="d-flex flex-column 
					justify-content-center align-items-center"
					style={{float: "inline-start"}}>
					<button
						onClick={click1}
						className="btn-magenta">
						Login
					</button>
					<button
						onClick={click2}
						className="btn-outline-magenta">
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
				<a href="#">
					<img src={`${githubLogo}`}></img>
				</a>
			</footer>
		</div>
	);
}




export default Login;