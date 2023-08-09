import logo from 'assets/logo.svg';
import '../styles/App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../utils/socket';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Nav } from 'react-bootstrap';

import Stack from 'react-bootstrap/Stack';
import { LinkContainer } from 'react-router-bootstrap'
import { Card } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

function BasicExample() {
	return (
		<Card style={{ width: '18rem' }}>
			<Card.Img variant="top" src="holder.js/100px180" />
			<Card.Body>
				<Card.Title>Card Title</Card.Title>
				<Card.Text>
					Some quick example text to build on the card title and make up the
					bulk of the card's content.
				</Card.Text>
			</Card.Body>
		</Card>
	);
}


function Home() {
	return (
		// !!! NOT SINGLE PAGE APP
		<Container>
			<Nav
				activeKey="/"
				onSelect={(selectedKey) => { }}
			>
				<Nav.Item>
					<Nav.Link href="/game">Game</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link href="/profile">Profile</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link href="/test-db">Test DB</Nav.Link>
				</Nav.Item>
			</Nav>
		</Container>
		// <Container>
		// 	<Stack direction="horizontal" gap={2}>
		// 		<LinkContainer to="/game">
		// 			<Button as="a" variant="primary">
		// 				Game
		// 			</Button>
		// 		</LinkContainer>
		// 		<LinkContainer to="/profile">
		// 			<Button as="a" variant="primary">
		// 				Profile
		// 			</Button>
		// 		</LinkContainer>
		// 		<LinkContainer to="/test-db">
		// 			<Button as="a" variant="primary">
		// 				Test DB
		// 			</Button>
		// 		</LinkContainer>
		// 	</Stack>
		// </Container >
	);

}

export default Home;