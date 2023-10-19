import { useState, useEffect } from 'react';
import React from 'react';
import { Button, Card} from 'react-bootstrap';
import { Link } from "react-router-dom";

export function Home() {
	return (
		<div className="d-flex align-items-center justify-content-center vh-100">
			<Card border="secondary" bg="dark" text="white" className="w-75 p-3">
				<Card.Body className="text-center">
					<Card.Title>Player vs player</Card.Title>
					<Card.Text>
					You are about to play a game against another player. Get ready to compete and have fun!
					</Card.Text>
					<Link to="/game" className="w-75">
						<button className="btn btn-primary"><b>Play</b></button>
					</Link>
				</Card.Body>
			</Card>
		</div>
	);

}
