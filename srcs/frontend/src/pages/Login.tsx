import '../styles/Login.css'
import '../styles/customButton.css'
import bg from '../assets/landingBg.png';
import githubLogo from '../assets/github.svg';

import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Login() {
	return (
		<LandingPage></LandingPage>
	);
}


function Signup() {

}

function Signin() {

}

function LandingPage() {
	return (
		<div className="landingPage"
			style={{ backgroundImage: `url(${bg})` }}>
			<div>
				<h2>PingPangPong</h2>
				<p style={{ color: "gray" }}>
					Si vous avez des amis, vous pouvez jouer à <br />
					ce jeu en multi joueur, sinon, une IA va se <br />
					charger de vous !
				</p>
			</div>
			<div>
				<button className="btn-magenta">Login</button><br />
				<button className="btn-outline-magenta">Sign up</button><br/>
				<button className="btn-invisible">Sign in with 42</button>
			</div>
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