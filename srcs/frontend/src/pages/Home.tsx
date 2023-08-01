import logo from 'assets/logo.svg';
import '../styles/App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../utils/socket';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { LinkContainer } from 'react-router-bootstrap'

function Home() {
	return (
		<Container>
			<Stack direction="horizontal" gap={2}>
				<LinkContainer to="/game">
					<Button as="a" variant="primary">
						Game
					</Button>
				</LinkContainer>
				<LinkContainer to="/profile">
					<Button as="a" variant="primary">
						Profile
					</Button>
				</LinkContainer>
				<LinkContainer to="/test-db">
					<Button as="a" variant="primary">
						Test DB
					</Button>
				</LinkContainer>
			</Stack>
		</Container>
	);
}

export default Home;