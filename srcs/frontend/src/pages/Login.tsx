import '../styles/Login.css'
import '../styles/customButton.css'
import Stack from 'react-bootstrap/Stack';
import Image from 'react-bootstrap/Image';
import bg from '../assets/landingBg.png';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Login() {
	return (
		<div className="landingPage" 
			style={{ backgroundImage: `url(${bg})`}}>
			<div>
				<h2>PingPangPong</h2>
				<p style={{color: "gray"}}>
					Si vous avez des amis, vous pouvez jouer à <br /> 
					ce jeu en multi joueur, sinon, une IA va se <br /> 
					charger de vous !
				</p>
			</div>
			<div style={{ position: "relative", bottom: "50px"}}>
				<button className="btn-magenta" style={{position: "relative", top: "0%"}}>Login</button>
				<button className="btn-outline-magenta">Sign up</button>
			</div>
			<footer style={{position: "absolute", bottom: "0"}}>
				created by 42 students <br/>
				<a>github link</a>
			</footer>
		</div>
	);
}

function Footer() {
	return (
		<Stack className="col-md-5 mx-auto">
			<p style={{
				color: "white",
				border: "1px solid white",
				textAlign: "center"
			}}>
				Projet de fin de tronc-commun de l’école 42
			</p>
		</Stack>
	);
}

function Signup() {

}

function Signin() {

}




export default Login;