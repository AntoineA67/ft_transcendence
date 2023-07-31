import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from './socket';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Menu() {

	// useEffect(() => {
	// }, []);

	return (
		<Container>
			<Row>
				<Col>1 of 1</Col>
			</Row>
		</Container>
	);
}

export default Menu;