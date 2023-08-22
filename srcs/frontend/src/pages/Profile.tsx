import '../styles/App.css';
import '../styles/Profile.css';

import { useState } from 'react';
import Container from 'react-bootstrap/Container'; 
import EditPen from '../assets/EditPen.svg';

type achievement = {
	date: string,
	content: string,
}

type match = {
	date: string,
	with: string,
	result: boolean,
	get: number,
	lose: number,
}

type profile = {
	nickname: string,
	bio: string,
	// avatar
	stat: number,
	achievement: achievement[],
	history: match[],
}

function stat() {
	return (
		<div>stat</div>
	);
}

function chart(prop: achievement[] | match[]) {
	return (
		<div>something</div>
	);
}

function Profile() {
	//get user data with fetch
	
	return (
		<Container className="py-5 text-center" style={{color: "white", border: "2px solid white"}}>
			<h5 className="py-5" >
				Intelligent Seagul
				<span><img src={EditPen} className="edit-pen" /></span>
			</h5>
			<p className="mx-5 text-break" >
				I live by the sea, but far from the bay. I play pingpong mid flight. I rob people of their chips.
				Gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa~
				<span><img src={EditPen} className="edit-pen" /></span>
			</p>

		</Container>
	);
}

export default Profile;