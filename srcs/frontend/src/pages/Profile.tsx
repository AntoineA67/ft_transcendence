import '../styles/App.css';
import '../styles/Profile.css';

import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import { useUser } from './Sidebar';

import Container from 'react-bootstrap/Container'; 
import EditPen from '../assets/EditPen.svg';
import Setting from '../assets/setting.svg';



function Profile() {
	const { nickname, bio, avatar, setNickname, setBio, setAvatar } = useUser();
	const [editnick, setEditnick] = useState(nickname);
	const [editbio, setEditbio] = useState(bio);

	const editNick = () => {

	}
	
	return (
		<Container className="my-5 d-flex flex-column align-items-center" style={{color: "white", border: "2px solid white"}}>
			<div className="position-absolute top-0 end-0">
				<Link to="."><button className="setting"/></Link>
			</div>

			<img alt="avatar" src={avatar}
				style={{height: "100px", width: "100px", borderRadius: "50%", border: "1px solid white"}} />
			
			<input className="my-5 mx-1 text-center input-profile" readOnly value={editnick} />
			<button className="edit-pen" onClick={editNick} />

			<input className="mx-5 text-break" readOnly value={bio} />			
			<button className="edit-pen" onClick={editNick} />

		</Container>
	);
}

export default Profile;