import '../styles/App.css';
import { useState, useEffect } from 'react';
import React from 'react';
import { Button, Card} from 'react-bootstrap';
import { Link } from "react-router-dom";

export function Home() {
	return (
		<div className="d-flex align-items-center justify-content-center vh-100">
			<Card border="secondary" bg="dark" text="white" className="w-75 p-3">
				<Card.Body>
					<Card.Title>Card Title</Card.Title>
					<Card.Text>
						Some quick example text to build on the card title and make up the
						bulk of the card's content.
					</Card.Text>
					<Link to="." className="w-75 link-text">
						<button className="btn btn-primary"><b>Play</b></button>
					</Link>
				</Card.Body>
			</Card>
		</div>
	);

}
