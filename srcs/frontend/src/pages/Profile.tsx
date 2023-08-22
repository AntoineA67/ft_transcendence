import '../styles/App.css';
import '../styles/Profile.css';

import { useState } from 'react';
import Container from 'react-bootstrap/Container'; 
import EditPen from '../assets/EditPen.svg';
import Setting from '../assets/setting.svg';

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
		<Container className="my-5 text-center" style={{color: "white", border: "2px solid white"}}>
			<div className="position-absolute top-0 end-0">
				<img src={Setting} className="m-3 pale-little-icon" />
			</div>
			<img alt="avatar" src={EditPen}
				style={{height: "200px", width: "200px", borderRadius: "50%", border: "1px solid white"}} />
			
			<h5 className="my-5" >
				Intelligent Seagul
				<span><img src={EditPen} className="pale-little-icon" /></span>
			</h5>
			<p className="mx-5 text-break" >
				I live by the sea, but far from the bay. I play pingpong mid flight. I rob people of their chips.
				Gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa~
				<span><img src={EditPen} className="pale-little-icon" /></span>
			</p>

		</Container>
	);
}

export default Profile;